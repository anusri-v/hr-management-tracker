const prisma = require('./prisma');

async function logActivity({ actorId, action, entityType, entityId, description }) {
    try {
        await prisma.activityLog.create({
            data: { actor_id: actorId, action, entity_type: entityType, entity_id: String(entityId), description },
        });
    } catch (e) {
        console.error('Failed to write activity log:', e.message);
    }
}

module.exports = { logActivity };
