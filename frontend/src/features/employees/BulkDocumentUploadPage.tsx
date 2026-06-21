import { Alert, Button, Flex, Modal, Select, Table, Tag, Tooltip, Typography, Upload, message } from "antd";
import { ArrowLeftOutlined, InboxOutlined, CloudUploadOutlined } from '@ant-design/icons';
import type { UploadFile } from "antd";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import apiClient from "../../utils/apiClient";
import {
  ONBOARDING_DOCUMENT_TYPES,
  EXIT_DOCUMENT_TYPES,
  DOCUMENT_LABELS,
} from "../../utils/types/documents";

const { Title, Text } = Typography;

type Proposal = {
  index: number;
  file_name: string;
  content_type: string;
  size: number;
  employee_id: string;
  employee_name: string;
  document_type: string;
  confidence: number;
  method: string;
};

type SkippedFile = { index: number; file_name: string; reason: string };

type ClassifyResponse = {
  success: boolean;
  proposals: Proposal[];
  skipped: SkippedFile[];
};

type Row = {
  index: number;
  file_name: string;
  content_type: string;
  size: number;
  employee_id: string;
  document_type: string;
  confidence: number;
  method: string;
};

type Employee = { employee_id: string; full_name: string };

type CommitResult = {
  uploaded: number;
  failed: number;
  errors: { file_name: string; message: string }[];
};

const DOC_TYPE_OPTIONS = [...ONBOARDING_DOCUMENT_TYPES, ...EXIT_DOCUMENT_TYPES].map((t) => ({
  label: DOCUMENT_LABELS[t] ?? t,
  value: t,
}));

const COMMIT_CONCURRENCY = 4;

const METHOD_LABELS: Record<string, string> = {
  id: "matched by employee ID",
  name: "matched by name",
  ai_filename: "AI · from filename",
  ai_document: "AI · read document",
};

function confidenceTier(c: number) {
  if (c >= 0.9) return { color: "green", label: "Strong" };
  if (c >= 0.75) return { color: "green", label: "Good" };
  if (c >= 0.6) return { color: "gold", label: "Fair" };
  return { color: "orange", label: "Low" };
}

function matchCell(row: Row) {
  // Surface what the user must act on, not a raw number.
  if (!row.employee_id) return <Tag color="red">No employee — pick one</Tag>;
  if (!row.document_type) return <Tag color="gold">Set document type</Tag>;

  const tier = confidenceTier(row.confidence);
  const method = METHOD_LABELS[row.method] ?? "";
  return (
    <Tooltip title={`${Math.round(row.confidence * 100)}% confidence`}>
      <Flex vertical gap={2} align="start">
        <Tag color={tier.color} style={{ marginInlineEnd: 0 }}>{tier.label}</Tag>
        {method && <Text type="secondary" style={{ fontSize: 12 }}>{method}</Text>}
      </Flex>
    </Tooltip>
  );
}

const BulkDocumentUploadPage = () => {
  const navigate = useNavigate();
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [rows, setRows] = useState<Row[]>([]);
  const [filesByIndex, setFilesByIndex] = useState<Map<number, File>>(new Map());
  const [skipped, setSkipped] = useState<SkippedFile[]>([]);
  const [classifying, setClassifying] = useState(false);
  const [committing, setCommitting] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [result, setResult] = useState<CommitResult | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const data = await apiClient.get<{ employees: Employee[] }>("/employee");
        setEmployees(data.employees ?? []);
      } catch {
        message.error("Failed to load employee list");
      }
    })();
  }, []);

  const employeeOptions = useMemo(
    () =>
      employees.map((e) => ({
        label: `${e.employee_id} — ${e.full_name}`,
        value: e.employee_id,
      })),
    [employees],
  );

  async function handleClassify() {
    const files = fileList
      .map((f) => f.originFileObj as File | undefined)
      .filter((f): f is File => !!f);
    if (files.length === 0) {
      message.warning("Select some files first");
      return;
    }

    setClassifying(true);
    setRows([]);
    setSkipped([]);
    try {
      const formData = new FormData();
      files.forEach((f) => formData.append("files", f));
      const res = await apiClient.postFile<ClassifyResponse>(
        "/employee/documents/bulk-classify",
        formData,
      );

      setFilesByIndex(new Map(files.map((f, i) => [i, f])));
      setRows(
        res.proposals.map((p) => ({
          index: p.index,
          file_name: p.file_name,
          content_type: p.content_type,
          size: p.size,
          employee_id: p.employee_id,
          document_type: p.document_type,
          confidence: p.confidence,
          method: p.method,
        })),
      );
      setSkipped(res.skipped ?? []);
    } catch (e: unknown) {
      const body = (e as { body?: { message?: string } })?.body;
      message.error(body?.message ?? "Classification failed");
    } finally {
      setClassifying(false);
    }
  }

  function updateRow(index: number, patch: Partial<Row>) {
    setRows((prev) => prev.map((r) => (r.index === index ? { ...r, ...patch } : r)));
  }

  function removeRow(index: number) {
    setRows((prev) => prev.filter((r) => r.index !== index));
  }

  // Commit one confirmed row through the existing single-document flow.
  async function commitRow(row: Row): Promise<{ ok: boolean; message?: string }> {
    const file = filesByIndex.get(row.index);
    if (!file) return { ok: false, message: "File no longer available" };
    try {
      const { upload_url, storage_key } = await apiClient.post<{
        upload_url: string;
        storage_key: string;
      }>(`/employee/${encodeURIComponent(row.employee_id)}/documents/upload-url`, {
        document_type: row.document_type,
        file_name: row.file_name,
        content_type: row.content_type,
      });

      await apiClient.uploadToUrl(upload_url, file);

      await apiClient.post(`/employee/${encodeURIComponent(row.employee_id)}/documents`, {
        document_type: row.document_type,
        file_name: row.file_name,
        storage_key,
        content_type: row.content_type,
        size: row.size,
      });
      return { ok: true };
    } catch (e: unknown) {
      const body = (e as { body?: { message?: string } })?.body;
      return { ok: false, message: body?.message ?? "Upload failed" };
    }
  }

  async function handleCommit() {
    const ready = rows.filter((r) => r.employee_id && r.document_type);
    if (ready.length === 0) {
      message.warning("No rows are ready — set an employee and document type first");
      return;
    }

    setCommitting(true);
    const errors: { file_name: string; message: string }[] = [];
    let uploaded = 0;

    // Bounded concurrency pool.
    let next = 0;
    async function worker() {
      while (next < ready.length) {
        const row = ready[next++];
        const r = await commitRow(row);
        if (r.ok) uploaded += 1;
        else errors.push({ file_name: row.file_name, message: r.message ?? "Upload failed" });
      }
    }
    await Promise.all(
      Array.from({ length: Math.min(COMMIT_CONCURRENCY, ready.length) }, worker),
    );

    setCommitting(false);
    setConfirmOpen(false);

    // All uploaded — done. Go back to the employee list.
    if (errors.length === 0) {
      message.success(`Uploaded ${uploaded} document${uploaded === 1 ? "" : "s"}`);
      navigate("/employees");
      return;
    }

    // Some failed — keep the page open so HR can retry just the failures.
    setResult({ uploaded, failed: errors.length, errors });
    const failedNames = new Set(errors.map((e) => e.file_name));
    setRows((prev) => prev.filter((r) => !r.employee_id || !r.document_type || failedNames.has(r.file_name)));
  }

  const readyCount = rows.filter((r) => r.employee_id && r.document_type).length;

  const columns = [
    { title: "File", dataIndex: "file_name", key: "file_name", ellipsis: true, width: 260 },
    {
      title: "Employee",
      key: "employee",
      width: 250,
      render: (_: unknown, row: Row) => (
        <Select
          showSearch
          allowClear
          placeholder="Search by ID or name"
          style={{ width: "100%" }}
          value={row.employee_id || undefined}
          options={employeeOptions}
          filterOption={(input, option) =>
            (option?.label ?? "").toLowerCase().includes(input.trim().toLowerCase())
          }
          notFoundContent="No matching employee"
          status={row.employee_id ? undefined : "warning"}
          onChange={(val) => updateRow(row.index, { employee_id: val ?? "" })}
        />
      ),
    },
    {
      title: "Document Type",
      key: "document_type",
      width: 200,
      render: (_: unknown, row: Row) => (
        <Select
          showSearch
          allowClear
          placeholder="Select type"
          style={{ width: "100%" }}
          value={row.document_type || undefined}
          options={DOC_TYPE_OPTIONS}
          optionFilterProp="label"
          status={row.document_type ? undefined : "warning"}
          onChange={(val) => updateRow(row.index, { document_type: val ?? "" })}
        />
      ),
    },
    {
      title: "Match",
      key: "confidence",
      width: 130,
      render: (_: unknown, row: Row) => matchCell(row),
    },
    {
      title: "",
      key: "actions",
      width: 100,
      align: "center" as const,
      render: (_: unknown, row: Row) => (
        <Button type="link" danger onClick={() => removeRow(row.index)}>
          Remove
        </Button>
      ),
    },
  ];

  return (
    <div style={{ paddingInlineEnd: 24 }}>
      <Flex justify="space-between">
        <Button type="text" icon={<ArrowLeftOutlined />} onClick={() => navigate("/employees")}>
          Back
        </Button>
      </Flex>

      <Title level={3} style={{ marginTop: 8 }}>Bulk Upload Documents</Title>

      <Text type="secondary">
        Drop in documents for any employees — files can be named anything. We'll
        identify who each file belongs to and its type, then you review before saving.
      </Text>

      <div style={{ marginTop: 16 }}>
        <Upload.Dragger
          multiple
          accept=".pdf,.jpg,.jpeg,.png"
          beforeUpload={() => false}
          fileList={fileList}
          onChange={({ fileList: fl }) => setFileList(fl)}
        >
          <p className="ant-upload-drag-icon"><InboxOutlined /></p>
          <p className="ant-upload-text">Click or drag PDF / JPG / PNG files here</p>
          <p className="ant-upload-hint">Up to 50 files, 5MB each.</p>
        </Upload.Dragger>

        <Flex gap={8} style={{ marginTop: 12 }}>
          <Button
            type="primary"
            loading={classifying}
            disabled={fileList.length === 0}
            onClick={handleClassify}
          >
            Identify Files
          </Button>
        </Flex>
      </div>

      {skipped.length > 0 && (
        <Alert
          style={{ marginTop: 16 }}
          type="warning"
          showIcon
          message={`${skipped.length} file(s) skipped`}
          description={
            <ul style={{ margin: 0, paddingLeft: 16 }}>
              {skipped.map((s) => (
                <li key={s.index}>{s.file_name}: {s.reason}</li>
              ))}
            </ul>
          }
        />
      )}

      {rows.length > 0 && (
        <>
          <Flex gap={16} style={{ marginTop: 16 }}>
            <Text type="secondary">
              <strong>{readyCount}</strong> ready to upload
            </Text>
            {rows.length - readyCount > 0 && (
              <Text type="warning">
                <strong>{rows.length - readyCount}</strong> need attention
              </Text>
            )}
          </Flex>
          <Table
            style={{ marginTop: 8 }}
            rowKey="index"
            dataSource={rows}
            columns={columns}
            pagination={false}
            scroll={{ x: "max-content" }}
          />
          <Flex justify="flex-end" style={{ marginTop: 24 }}>
            <Button
              type="primary"
              size="large"
              icon={<CloudUploadOutlined />}
              loading={committing}
              disabled={readyCount === 0}
              onClick={() => setConfirmOpen(true)}
            >
              Upload {readyCount} Document{readyCount === 1 ? "" : "s"}
            </Button>
          </Flex>
        </>
      )}

      <Modal
        title="Upload documents?"
        open={confirmOpen}
        onOk={handleCommit}
        onCancel={() => setConfirmOpen(false)}
        okText="Upload"
        confirmLoading={committing}
      >
        <p>
          You're about to upload <strong>{readyCount}</strong> document{readyCount === 1 ? "" : "s"} to their matched employees.
        </p>
        {rows.length - readyCount > 0 && (
          <Text type="warning">
            {rows.length - readyCount} row{rows.length - readyCount === 1 ? "" : "s"} without an employee or document type will be skipped.
          </Text>
        )}
      </Modal>

      <Modal
        title="Upload Results"
        open={result !== null}
        onOk={() => setResult(null)}
        onCancel={() => setResult(null)}
        cancelButtonProps={{ style: { display: "none" } }}
      >
        {result && (
          <>
            <p>Uploaded: <strong>{result.uploaded}</strong> &nbsp; Failed: <strong>{result.failed}</strong></p>
            {result.errors.length > 0 && (
              <ul style={{ maxHeight: 240, overflowY: "auto", paddingLeft: 16 }}>
                {result.errors.map((err, i) => (
                  <li key={i}>{err.file_name}: {err.message}</li>
                ))}
              </ul>
            )}
          </>
        )}
      </Modal>
    </div>
  );
};

export default BulkDocumentUploadPage;
