const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { fieldEncryptionExtension } = require('prisma-field-encryption');

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter }).$extends(fieldEncryptionExtension());

module.exports = prisma;
