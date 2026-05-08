const express = require('express');
const { Prisma } = require('@prisma/client');

const router = express.Router();
const prisma = require('../lib/prisma');

module.exports = router;