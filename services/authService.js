const { PrismaClient } = require('../generated/prisma');

const prisma = new PrismaClient();

/**
 * Auth Service
 * Manages multiple authentication methods (web3auth, OAuth2, SSO, DWeb)
 */
class AuthService {
  /**
   * Register auth provider
   */
  async registerAuthProvider(providerData) {
    const { providerType, providerName, config, selfRegistration } = providerData;

    return await prisma.authProvider.create({
      data: {
        providerType,
        providerName,
        config: config ? JSON.parse(JSON.stringify(config)) : null,
        selfRegistration: selfRegistration || false
      }
    });
  }

  /**
   * Get enabled auth providers
   */
  async getEnabledProviders() {
    return await prisma.authProvider.findMany({
      where: { isEnabled: true },
      orderBy: [{ providerType: 'asc' }, { providerName: 'asc' }]
    });
  }

  /**
   * Get providers by type
   */
  async getProvidersByType(providerType) {
    return await prisma.authProvider.findMany({
      where: {
        providerType,
        isEnabled: true
      }
    });
  }

  /**
   * Add auth method to user
   */
  async addUserAuthMethod(userId, authProviderId, externalId, credentials = null) {
    // Check if this is user's first auth method (make it primary)
    const existingMethods = await prisma.userAuthMethod.count({
      where: { userId }
    });

    const isPrimary = existingMethods === 0;

    return await prisma.userAuthMethod.create({
      data: {
        userId,
        authProviderId,
        externalId,
        credentials: credentials ? JSON.parse(JSON.stringify(credentials)) : null,
        isPrimary,
        verifiedAt: new Date()
      }
    });
  }

  /**
   * Get user auth methods
   */
  async getUserAuthMethods(userId) {
    return await prisma.userAuthMethod.findMany({
      where: { userId },
      include: {
        AuthProvider: true
      },
      orderBy: [{ isPrimary: 'desc' }, { created_at: 'asc' }]
    });
  }

  /**
   * Set primary auth method
   */
  async setPrimaryAuthMethod(userId, authMethodId) {
    // Unset all primary methods
    await prisma.userAuthMethod.updateMany({
      where: { userId },
      data: { isPrimary: false }
    });

    // Set new primary
    return await prisma.userAuthMethod.update({
      where: { id: authMethodId },
      data: { isPrimary: true }
    });
  }

  /**
   * Authenticate user by external ID
   */
  async authenticateByExternalId(authProviderId, externalId) {
    const authMethod = await prisma.userAuthMethod.findUnique({
      where: {
        authProviderId_externalId: {
          authProviderId,
          externalId
        }
      },
      include: {
        AppUser: true,
        AuthProvider: true
      }
    });

    return authMethod;
  }

  /**
   * Initialize default auth providers
   */
  async initializeDefaultProviders() {
    const defaultProviders = [
      // OAuth2 providers
      { providerType: 'oauth2', providerName: 'google', selfRegistration: false },
      { providerType: 'oauth2', providerName: 'x', selfRegistration: false },
      { providerType: 'oauth2', providerName: 'discord', selfRegistration: false },
      { providerType: 'oauth2', providerName: 'facebook', selfRegistration: false },
      
      // Wallet providers (via web3auth)
      { providerType: 'wallet', providerName: 'ethereum', selfRegistration: false },
      { providerType: 'wallet', providerName: 'solana', selfRegistration: false },
      { providerType: 'wallet', providerName: 'base', selfRegistration: false },
      
      // DWeb providers
      { providerType: 'dweb', providerName: 'mastodon', selfRegistration: false },
      { providerType: 'dweb', providerName: 'nostr', selfRegistration: false },
      { providerType: 'dweb', providerName: 'universal_id', selfRegistration: false },
      
      // SSO (self-registration enabled)
      { providerType: 'sso', providerName: 'custom', selfRegistration: true }
    ];

    for (const provider of defaultProviders) {
      const existing = await prisma.authProvider.findUnique({
        where: {
          providerType_providerName: {
            providerType: provider.providerType,
            providerName: provider.providerName
          }
        }
      });

      if (!existing) {
        await this.registerAuthProvider(provider);
      }
    }
  }
}

module.exports = new AuthService();













