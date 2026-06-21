const OpenAI = require('openai');

// ---------------------------------------------------------------------------
// LLM-assisted bulk document classification (OpenAI / gpt-4o-mini).
//
// Given a batch of uploaded files and the current employee roster, work out
// which employee + document type each file belongs to. Two stages:
//   A) filename pass  — one cheap call over all filenames + roster.
//   B) content pass   — for files A couldn't confidently map, read the file
//                       bytes (PDF/image) and re-classify.
// Output is advisory only: the caller shows it to HR for review before any
// document is actually saved.
// ---------------------------------------------------------------------------

const MODEL = 'gpt-4o-mini';
const CONFIDENCE_THRESHOLD = 0.6;
const CONTENT_PASS_CONCURRENCY = 5;

// Content types we can send to the model for the content pass.
const PDF_TYPE = 'application/pdf';
const IMAGE_TYPES = new Set(['image/jpeg', 'image/png']);

// Human-readable labels help the model reason about the type enum.
const TYPE_LABELS = {
    offer_letter: 'Offer Letter',
    signed_offer_letter: 'Signed Offer Letter',
    aadhar_card: 'Aadhar Card',
    pan_card: 'PAN Card',
    bank_passbook: 'Bank Passbook',
    passport: 'Passport',
    photo: 'Photograph / passport-size photo',
    driving_license: 'Driving License',
    tenth_marksheet: '10th / Class X marksheet (Secondary School Leaving Certificate / SSLC)',
    twelfth_marksheet: '12th / Class XII marksheet (Higher Secondary Certificate / HSC)',
    other: 'Other / unclassifiable document',
    no_dues_form: 'No Dues Form',
    exit_interview_form: 'Exit Interview Form',
    resignation_acceptance_letter: 'Resignation Acceptance Letter',
};

// ---------------------------------------------------------------------------
// Deterministic (no-LLM) filename matcher.
//
// Parses a filename for an employee-id substring, a person's name (fuzzy
// matched against the roster), and a document-type keyword. Confident matches
// skip the LLM entirely. e.g. "Anusri V_ShopUp Offer Letter.pdf" ->
// { employee_id of the closest "Anusri V", document_type: offer_letter }.
// ---------------------------------------------------------------------------

// Document-type keyword phrases, most specific first. Matched against the
// normalized (spaced) filename.
const TYPE_KEYWORDS = [
    ['signed_offer_letter', ['signed offer', 'countersigned offer', 'signed appointment']],
    ['offer_letter', ['offer letter', 'appointment letter', 'offer', 'appointment']],
    ['twelfth_marksheet', ['12th', 'twelfth', 'class 12', 'class xii', 'higher secondary', 'hsc', 'senior secondary', 'intermediate']],
    ['tenth_marksheet', ['10th', 'tenth', 'class 10', 'class x', 'sslc', 'matriculation', 'secondary school leaving']],
    ['no_dues_form', ['no dues', 'no due', 'nodues', 'clearance']],
    ['exit_interview_form', ['exit interview']],
    ['resignation_acceptance_letter', ['resignation acceptance', 'resignation', 'acceptance of resignation', 'relieving']],
    ['aadhar_card', ['aadhaar', 'aadhar', 'uid']],
    ['pan_card', ['pan']],
    ['bank_passbook', ['passbook', 'bank statement', 'bank']],
    ['passport', ['passport']],
    ['driving_license', ['driving licence', 'driving license', 'driving', 'licence', 'license', 'dl']],
    ['photo', ['photograph', 'photo', 'passport size', 'headshot', 'pic']],
];

// Tokens that are never part of a person's name.
const NOISE_TOKENS = new Set([
    'shopup', 'silq', 'document', 'documents', 'doc', 'docs', 'scan', 'scanned', 'copy', 'final',
    'form', 'card', 'letter', 'other', 'employee', 'emp', 'id', 'pdf', 'jpg', 'jpeg', 'png',
    // type keywords
    'signed', 'offer', 'appointment', 'countersigned', 'no', 'dues', 'due', 'nodues', 'clearance',
    'exit', 'interview', 'resignation', 'acceptance', 'relieving', 'aadhaar', 'aadhar', 'uid', 'pan',
    'passbook', 'bank', 'statement', 'passport', 'driving', 'licence', 'license', 'dl', 'photograph',
    'photo', 'size', 'headshot', 'pic',
    // marksheet keywords
    'marksheet', 'marks', 'sheet', '10th', '12th', 'tenth', 'twelfth', 'class', 'sslc', 'hsc',
    'matriculation', 'secondary', 'higher', 'senior', 'intermediate', 'certificate', 'board', 'cbse', 'standard',
]);

function normalizeText(s) {
    return String(s || '')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
}

// Levenshtein distance (small inputs).
function lev(a, b) {
    const m = a.length, n = b.length;
    const prev = Array.from({ length: n + 1 }, (_, i) => i);
    for (let i = 1; i <= m; i++) {
        let diag = prev[0];
        prev[0] = i;
        for (let j = 1; j <= n; j++) {
            const tmp = prev[j];
            prev[j] = Math.min(
                prev[j] + 1,
                prev[j - 1] + 1,
                diag + (a[i - 1] === b[j - 1] ? 0 : 1),
            );
            diag = tmp;
        }
    }
    return prev[n];
}

function detectType(normFilename) {
    for (const [type, phrases] of TYPE_KEYWORDS) {
        if (phrases.some((p) => normFilename.includes(p))) return type;
    }
    return '';
}

// How well a single employee-name token is covered by the filename tokens.
// Returns 0..1; the best coverage found.
function tokenCoverage(empTok, fileToks) {
    let best = 0;
    for (const ft of fileToks) {
        if (ft === empTok) return 1;
        if (empTok.length >= 4 && ft.length >= 4 && (empTok.startsWith(ft) || ft.startsWith(empTok))) best = Math.max(best, 0.9);
        else if (empTok.length >= 4 && lev(empTok, ft) <= 1) best = Math.max(best, 0.85);
        else if (ft.length === 1 && empTok.startsWith(ft)) best = Math.max(best, 0.6); // initial
    }
    return best;
}

// Best fuzzy name match for the filename's name tokens against the roster.
function matchEmployeeByName(fileToks, roster) {
    const fileJoined = fileToks.join('');
    let best = null, second = null;
    for (const e of roster) {
        const empToks = normalizeText(e.full_name).split(' ').filter(Boolean);
        if (empToks.length === 0) continue;

        // Token-by-token coverage (handles separated names + initials).
        let sum = 0, strongFull = false;
        for (const et of empToks) {
            const c = tokenCoverage(et, fileToks);
            sum += c;
            if (et.length >= 4 && c >= 0.85) strongFull = true;
        }
        const tokenScore = strongFull ? sum / empToks.length : 0;

        // Joined comparison (handles concatenated names, e.g. "anusriv" == "Anusri V").
        const empJoined = empToks.join('');
        let joinedScore = 0;
        if (empJoined.length >= 4 && fileJoined.length >= 4) {
            if (empJoined === fileJoined) joinedScore = 1;
            else if (empJoined.startsWith(fileJoined) || fileJoined.startsWith(empJoined)) joinedScore = 0.88;
            else {
                const d = lev(empJoined, fileJoined);
                if (d / Math.max(empJoined.length, fileJoined.length) <= 0.2) joinedScore = 0.85;
            }
        }

        const score = Math.max(tokenScore, joinedScore);
        if (best === null || score > best.score) { second = best; best = { employee_id: e.employee_id, score }; }
        else if (second === null || score > second.score) { second = { employee_id: e.employee_id, score }; }
    }
    if (!best || best.score < 0.6) return null;
    // Ambiguity guard: the top match must clearly beat the runner-up.
    if (second && second.score >= 0.6 && best.score - second.score < 0.12) return null;
    return best;
}

function matchByFilename(file, roster, documentTypes, idKeys) {
    const norm = normalizeText(file.file_name);
    const document_type = documentTypes.includes(detectType(norm)) ? detectType(norm) : '';

    // 1. Employee-id substring (most reliable).
    const fileKey = norm.replace(/ /g, '');
    for (const { employee_id, key } of idKeys) {
        if (key.length >= 4 && fileKey.includes(key)) {
            return { employee_id, document_type, confidence: 0.97, method: 'id' };
        }
    }

    // 2. Fuzzy name match on the non-noise tokens.
    const fileToks = norm.split(' ').filter((t) => t && /[a-z]/.test(t) && !NOISE_TOKENS.has(t));
    if (fileToks.length > 0) {
        const m = matchEmployeeByName(fileToks, roster);
        if (m) return { employee_id: m.employee_id, document_type, confidence: Math.min(0.95, 0.6 + m.score * 0.35), method: 'name' };
    }

    return null; // no confident deterministic match
}

let client = null;
function getClient() {
    if (!process.env.OPENAI_API_KEY) {
        const err = new Error('OPENAI_API_KEY is not configured');
        err.code = 'NO_API_KEY';
        throw err;
    }
    if (!client) client = new OpenAI();
    return client;
}

function rosterText(roster) {
    return roster
        .map((e) => `${e.employee_id} | ${e.full_name}${e.department ? ` | ${e.department}` : ''}`)
        .join('\n');
}

function typeListText(documentTypes) {
    return documentTypes.map((t) => `${t} — ${TYPE_LABELS[t] || t}`).join('\n');
}

// One result object per file. employee_id / document_type are "" when unknown.
// Strict JSON-schema mode requires every property to be required and
// additionalProperties:false on every object.
function resultSchema(documentTypes, multiple) {
    const item = {
        type: 'object',
        properties: {
            index: { type: 'integer' },
            employee_id: { type: 'string' },
            document_type: { type: 'string', enum: [...documentTypes, ''] },
            confidence: { type: 'number' },
        },
        required: ['index', 'employee_id', 'document_type', 'confidence'],
        additionalProperties: false,
    };
    if (!multiple) return item;
    return {
        type: 'object',
        properties: { results: { type: 'array', items: item } },
        required: ['results'],
        additionalProperties: false,
    };
}

function responseFormat(documentTypes, multiple) {
    return {
        type: 'json_schema',
        json_schema: {
            name: 'document_classification',
            strict: true,
            schema: resultSchema(documentTypes, multiple),
        },
    };
}

const SYSTEM = (roster, documentTypes) =>
    `You are an HR assistant that files employee documents. Map each uploaded ` +
    `file to exactly one employee and one document type.\n\n` +
    `EMPLOYEE ROSTER (employee_id | full_name | department):\n${rosterText(roster)}\n\n` +
    `ALLOWED DOCUMENT TYPES (value — meaning):\n${typeListText(documentTypes)}\n\n` +
    `Rules:\n` +
    `- employee_id MUST be one of the roster employee_id values, or "" if you ` +
    `cannot confidently determine the employee.\n` +
    `- document_type MUST be one of the allowed type values, or "" if unknown. ` +
    `Use "other" only when the document is clearly a real document of none of the ` +
    `specific types.\n` +
    `- confidence is 0..1 reflecting how sure you are of BOTH the employee and the type.\n` +
    `- Never invent an employee_id that is not in the roster.`;

function parseContent(completion) {
    const msg = completion.choices?.[0]?.message;
    if (!msg) throw new Error('Model returned no message');
    if (msg.refusal) throw new Error(`Model refused: ${msg.refusal}`);
    return JSON.parse(msg.content);
}

// Stage A — classify all files from their filenames in a single call.
async function classifyByFilename({ files, roster, documentTypes }) {
    const fileLines = files
        .map((f) => `${f.index}: ${f.file_name} (${f.content_type || 'unknown type'})`)
        .join('\n');

    const completion = await getClient().chat.completions.create({
        model: MODEL,
        temperature: 0,
        max_tokens: 4000,
        response_format: responseFormat(documentTypes, true),
        messages: [
            { role: 'system', content: SYSTEM(roster, documentTypes) },
            {
                role: 'user',
                content:
                    `Classify these uploaded files using only their filenames. Return one ` +
                    `result for every index.\n\nFILES (index: filename):\n${fileLines}`,
            },
        ],
    });

    const parsed = parseContent(completion);
    const byIndex = new Map();
    for (const r of parsed.results || []) byIndex.set(r.index, r);
    return byIndex;
}

// Stage B — re-classify a single file from its actual content.
async function classifyByContent({ file, roster, documentTypes }) {
    const isPdf = file.content_type === PDF_TYPE;
    const isImage = IMAGE_TYPES.has(file.content_type);
    if (!isPdf && !isImage) return null; // can't read this content type

    const base64 = file.buffer.toString('base64');
    const fileBlock = isPdf
        ? { type: 'file', file: { filename: file.file_name, file_data: `data:${PDF_TYPE};base64,${base64}` } }
        : { type: 'image_url', image_url: { url: `data:${file.content_type};base64,${base64}` } };

    const completion = await getClient().chat.completions.create({
        model: MODEL,
        temperature: 0,
        max_tokens: 300,
        response_format: responseFormat(documentTypes, false),
        messages: [
            { role: 'system', content: SYSTEM(roster, documentTypes) },
            {
                role: 'user',
                content: [
                    {
                        type: 'text',
                        text:
                            `Read this document (original filename: "${file.file_name}") and ` +
                            `determine which employee it belongs to and its document type. ` +
                            `Match the person named/identified in the document against the roster. ` +
                            `Return a single result with index ${file.index}.`,
                    },
                    fileBlock,
                ],
            },
        ],
    });

    return parseContent(completion);
}

// Run async tasks with a bounded concurrency pool.
async function pool(items, limit, worker) {
    let next = 0;
    async function run() {
        while (next < items.length) {
            const i = next++;
            await worker(items[i], i);
        }
    }
    await Promise.all(Array.from({ length: Math.min(limit, items.length) }, run));
}

// Public entry point. Returns one classification per input file (same order).
async function classifyDocuments({ files, roster, documentTypes }) {
    if (files.length === 0) return [];

    // Pre-pass: deterministic filename match (employee-id / fuzzy name / type
    // keyword). No LLM. Confident matches are kept and skip the LLM entirely.
    const idKeys = roster.map((e) => ({
        employee_id: e.employee_id,
        key: String(e.employee_id || '').toLowerCase().replace(/[^a-z0-9]/g, ''),
    }));

    const byIndex = new Map();
    const remaining = [];
    for (const f of files) {
        const m = matchByFilename(f, roster, documentTypes, idKeys);
        if (m && m.employee_id) byIndex.set(f.index, { index: f.index, ...m });
        else remaining.push(f);
    }

    // LLM filename pass only for files the deterministic pass couldn't place.
    if (remaining.length > 0) {
        const llm = await classifyByFilename({ files: remaining, roster, documentTypes });
        for (const [i, r] of llm) byIndex.set(i, { ...r, method: 'ai_filename' });
    }

    // Files that need the content pass: unmatched or low-confidence, and readable.
    const needsContent = files.filter((f) => {
        const a = byIndex.get(f.index);
        const weak = !a || !a.employee_id || (a.confidence ?? 0) < CONFIDENCE_THRESHOLD;
        const readable = f.content_type === PDF_TYPE || IMAGE_TYPES.has(f.content_type);
        return weak && readable;
    });

    await pool(needsContent, CONTENT_PASS_CONCURRENCY, async (file) => {
        try {
            const refined = await classifyByContent({ file, roster, documentTypes });
            if (refined) byIndex.set(file.index, { ...refined, index: file.index, method: 'ai_document' });
        } catch (e) {
            console.error(`Content classification failed for "${file.file_name}":`, e.message);
        }
    });

    return files.map((f) => {
        const r = byIndex.get(f.index) || {};
        return {
            index: f.index,
            employee_id: r.employee_id || '',
            document_type: r.document_type || '',
            confidence: typeof r.confidence === 'number' ? r.confidence : 0,
            method: r.method || '',
        };
    });
}

module.exports = { classifyDocuments };
