const { PrismaClient } = require('../generated/prisma');

const prisma = new PrismaClient();

/**
 * Treasury Service
 * Manages treasury transactions, balances, and allocations
 */
class TreasuryService {
  /**
   * Get current treasury balances
   */
  async getBalances() {
    return await prisma.treasuryBalance.findMany({
      orderBy: { currency: 'asc' }
    });
  }

  /**
   * Get balance for specific currency
   */
  async getBalance(currency, category = null) {
    const where = { currency };
    if (category) where.category = category;

    return await prisma.treasuryBalance.findUnique({
      where: category 
        ? { currency_category: { currency, category } }
        : { currency_category: { currency, category: null } }
    });
  }

  /**
   * Update treasury balance
   */
  async updateBalance(currency, amount, category = null) {
    const existing = await this.getBalance(currency, category);
    
    if (existing) {
      return await prisma.treasuryBalance.update({
        where: { id: existing.id },
        data: {
          balance: amount,
          available: amount - existing.allocated,
          updated_at: new Date()
        }
      });
    } else {
      return await prisma.treasuryBalance.create({
        data: {
          currency,
          balance: amount,
          available: amount,
          allocated: 0,
          category
        }
      });
    }
  }

  /**
   * Allocate funds (reserve for specific purpose)
   */
  async allocateFunds(currency, amount, category = null) {
    const balance = await this.getBalance(currency, category);
    if (!balance) {
      throw new Error(`No balance found for ${currency}${category ? ` in category ${category}` : ''}`);
    }

    if (balance.available < amount) {
      throw new Error('Insufficient available funds');
    }

    return await prisma.treasuryBalance.update({
      where: { id: balance.id },
      data: {
        allocated: balance.allocated + amount,
        available: balance.available - amount,
        updated_at: new Date()
      }
    });
  }

  /**
   * Release allocated funds
   */
  async releaseAllocation(currency, amount, category = null) {
    const balance = await this.getBalance(currency, category);
    if (!balance) {
      throw new Error(`No balance found for ${currency}${category ? ` in category ${category}` : ''}`);
    }

    if (balance.allocated < amount) {
      throw new Error('Cannot release more than allocated');
    }

    return await prisma.treasuryBalance.update({
      where: { id: balance.id },
      data: {
        allocated: balance.allocated - amount,
        available: balance.available + amount,
        updated_at: new Date()
      }
    });
  }

  /**
   * Create treasury transaction
   */
  async createTransaction(data) {
    const { amount, currency, transactionType, ...rest } = data;

    // Update balance based on transaction type
    const balance = await this.getBalance(currency);
    if (!balance) {
      // Create balance if it doesn't exist
      await this.updateBalance(currency, 0);
    }

    const transaction = await prisma.treasuryTransaction.create({
      data: {
        amount,
        currency,
        transactionType,
        metadata: rest.metadata ? JSON.parse(JSON.stringify(rest.metadata)) : null,
        ...rest
      }
    });

    // Update balance after transaction is executed
    if (transaction.status === 'executed') {
      await this.processTransaction(transaction);
    }

    return transaction;
  }

  /**
   * Process executed transaction (update balances)
   */
  async processTransaction(transaction) {
    const balance = await this.getBalance(transaction.currency);
    if (!balance) {
      await this.updateBalance(transaction.currency, 0);
    }

    let newBalance = balance.balance;
    if (transaction.transactionType === 'income') {
      newBalance += transaction.amount;
    } else if (transaction.transactionType === 'expense') {
      newBalance -= transaction.amount;
    } else if (transaction.transactionType === 'transfer') {
      // Handle transfer logic
      newBalance -= transaction.amount;
    }

    await this.updateBalance(transaction.currency, newBalance);
  }

  /**
   * Execute transaction (approve and execute)
   */
  async executeTransaction(transactionId, executedBy, executionHash = null) {
    const transaction = await prisma.treasuryTransaction.findUnique({
      where: { id: transactionId }
    });

    if (!transaction) {
      throw new Error('Transaction not found');
    }

    if (transaction.status !== 'approved') {
      throw new Error('Transaction must be approved before execution');
    }

    const updated = await prisma.treasuryTransaction.update({
      where: { id: transactionId },
      data: {
        status: 'executed',
        executedBy,
        executionHash,
        executed_at: new Date()
      }
    });

    // Process the transaction (update balances)
    await this.processTransaction(updated);

    return updated;
  }

  /**
   * Approve transaction
   */
  async approveTransaction(transactionId, approvedBy) {
    return await prisma.treasuryTransaction.update({
      where: { id: transactionId },
      data: {
        status: 'approved',
        approvedBy,
        updated_at: new Date()
      }
    });
  }

  /**
   * Get transaction history
   */
  async getTransactionHistory(filters = {}) {
    const { transactionType, category, status, limit = 50, offset = 0 } = filters;

    const where = {};
    if (transactionType) where.transactionType = transactionType;
    if (category) where.category = category;
    if (status) where.status = status;

    return await prisma.treasuryTransaction.findMany({
      where,
      include: {
        Proposal: {
          select: { id: true, title: true }
        },
        Approver: {
          select: { id: true, handle: true, name: true }
        },
        Executor: {
          select: { id: true, handle: true, name: true }
        }
      },
      orderBy: { created_at: 'desc' },
      take: limit,
      skip: offset
    });
  }

  /**
   * Get treasury summary
   */
  async getTreasurySummary() {
    const balances = await this.getBalances();
    const recentTransactions = await this.getTransactionHistory({ limit: 10 });

    const totalByCurrency = balances.reduce((acc, b) => {
      acc[b.currency] = (acc[b.currency] || 0) + b.balance;
      return acc;
    }, {});

    return {
      balances,
      totalByCurrency,
      recentTransactions,
      summary: {
        totalCurrencies: balances.length,
        totalAllocated: balances.reduce((sum, b) => sum + b.allocated, 0),
        totalAvailable: balances.reduce((sum, b) => sum + b.available, 0)
      }
    };
  }
}

module.exports = new TreasuryService();













