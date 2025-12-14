/**
 * TAB MANAGER CRITICAL FIXES PATCH
 * Direct JavaScript fixes for TabManager availability and loading gif issues
 * Load this script in browser console or as emergency patch
 */

(function() {
    'use strict';

    console.log('🔧 TAB MANAGER CRITICAL FIXES PATCH LOADING...');

    // FIX 1: Ensure TabStateManager is available on window
    if (typeof window.tabStateManager === 'undefined') {
        console.log('🔧 Creating TabStateManager singleton...');

        // Simple TabStateManager implementation
        function TabStateManager() {
            this.loadingStates = new Map();
            this.loadedTabs = new Set();
            this.themeChangeInProgress = false;
            this.VALID_TAB_IDS = new Set([
                'discuss-tab', 'visibility-tab', 'rooms-tab', 'people-tab',
                'agent-tab', 'timelines-tab', 'settings-tab', 'manage-tab'
            ]);
        }

        TabStateManager.prototype = {
            isTabLoading: function(tabId) {
                return this.loadingStates.get(tabId) || false;
            },

            isTabLoaded: function(tabId) {
                return this.loadedTabs.has(tabId);
            },

            setTabLoading: function(tabId, loading) {
                if (!this.VALID_TAB_IDS.has(tabId)) {
                    console.warn('SECURITY: Invalid tabId rejected:', tabId);
                    return;
                }

                if (loading) {
                    this.loadingStates.set(tabId, true);
                    console.debug('🔄 TabStateManager: Started loading tab', tabId);
                } else {
                    this.loadingStates.set(tabId, false);
                    this.loadedTabs.add(tabId);
                    console.debug('✅ TabStateManager: Finished loading tab', tabId);
                }
            },

            shouldLoadTab: function(tabId, operation) {
                switch (operation) {
                    case 'LOAD': return true;
                    case 'SWITCH': return !this.isTabLoaded(tabId);
                    case 'REFRESH': return true;
                    default: return false;
                }
            },

            setThemeChanging: function(changing) {
                // ROOT CAUSE FIX: Prevent theme changes during tab operations
                if (changing && window.tabContextManager && window.tabContextManager.operationInProgress) {
                    console.warn('THEME_POLLUTION_PREVENTED: Theme change blocked during tab operation');
                    return;
                }

                this.themeChangeInProgress = changing;
                if (changing) {
                    console.debug('🎨 TabStateManager: Theme change started');
                } else {
                    console.debug('🎨 TabStateManager: Theme change completed');
                }
            },

            isThemeChanging: function() {
                return this.themeChangeInProgress;
            },

            validateOperation: function(tabId, operation) {
                if (!this.VALID_TAB_IDS.has(tabId)) {
                    return { valid: false, reason: 'Invalid tab identifier' };
                }

                if (operation !== 'REFRESH' && this.isTabLoading(tabId)) {
                    return { valid: false, reason: 'Tab ' + tabId + ' is already loading' };
                }

                if (operation === 'SWITCH' && !this.isTabLoaded(tabId)) {
                    return { valid: false, reason: 'Cannot SWITCH to unloaded tab ' + tabId };
                }

                return { valid: true };
            }
        };

        // Create singleton instance
        var tabStateManagerInstance = null;
        window.getTabStateManager = function() {
            if (!tabStateManagerInstance) {
                tabStateManagerInstance = new TabStateManager();
            }
            return tabStateManagerInstance;
        };

        // Expose singleton
        window.tabStateManager = window.getTabStateManager();

        console.log('✅ TabStateManager singleton created and exposed');
    }

    // FIX 2: Ensure TabManager is available on window
    if (typeof window.tabContextManager === 'undefined') {
        console.log('🔧 Creating TabManager singleton...');

        // Simple TabManager implementation with critical methods
        function TabManager() {
            this.operationInProgress = false;
            this.operationStartTime = 0;
            this.OPERATION_TIMEOUT = 10000;
            this.VALID_TAB_IDS = new Set([
                'discuss-tab', 'visibility-tab', 'rooms-tab', 'people-tab',
                'agent-tab', 'timelines-tab', 'settings-tab', 'manage-tab'
            ]);
            this.tabStateManager = window.tabStateManager;
        }

        TabManager.prototype = {
            performTabOperation: function(tabId, options) {
                return this.triggerTabSwitch(tabId, options);
            },

            triggerTabSwitch: function(tabId, options) {
                options = options || { operation: 'SWITCH' };

                try {
                    // Prevent concurrent operations
                    if (this.operationInProgress) {
                        console.debug('BLIND-SPOT: Operation already in progress for tab', tabId);
                        return Promise.resolve();
                    }

                    this.operationInProgress = true;
                    this.operationStartTime = Date.now();

                    // Prevent theme changes during operation
                    if (this.tabStateManager) {
                        this.tabStateManager.setThemeChanging(true);
                    }

                    // Validate operation
                    if (this.tabStateManager) {
                        var validation = this.tabStateManager.validateOperation(tabId, options.operation);
                        if (!validation.valid) {
                            console.debug('ℹ️ TabManager: Skipping tab switch -', validation.reason);
                            return Promise.resolve();
                        }
                    }

                    // Update DOM
                    this._updateTabUI(tabId);

                    // Handle tab content loading
                    return this._handleTabContent(tabId, options).finally(function() {
                        // Reset operation state
                        this.operationInProgress = false;
                        this.operationStartTime = 0;

                        // Allow theme changes again
                        if (this.tabStateManager) {
                            this.tabStateManager.setThemeChanging(false);
                        }

                        // Dispatch event
                        document.dispatchEvent(new CustomEvent('tabManager:tabSwitched', {
                            detail: {
                                tabId: tabId,
                                operation: options.operation,
                                currentTab: tabId,
                                wasLoaded: this.tabStateManager ? this.tabStateManager.isTabLoaded(tabId) : false
                            }
                        }));
                    }.bind(this));

                } catch (error) {
                    console.error('TabManager operation failed:', error);
                    this.operationInProgress = false;
                    this.operationStartTime = 0;
                    if (this.tabStateManager) {
                        this.tabStateManager.setThemeChanging(false);
                    }
                    return Promise.reject(error);
                }
            },

            _updateTabUI: function(tabId) {
                // Update tab buttons
                var tabButtons = document.querySelectorAll('.main-nav-tab');
                for (var i = 0; i < tabButtons.length; i++) {
                    tabButtons[i].classList.remove('active');
                    tabButtons[i].setAttribute('aria-selected', 'false');
                }

                // Update tab contents
                var tabContents = document.querySelectorAll('.main-tab-content');
                for (var i = 0; i < tabContents.length; i++) {
                    tabContents[i].classList.remove('active');
                }

                // Activate target elements
                var targetButton = document.querySelector('[data-tab="' + tabId + '"]');
                if (targetButton) {
                    targetButton.classList.add('active');
                    targetButton.setAttribute('aria-selected', 'true');
                }

                var targetContent = document.getElementById(tabId);
                if (targetContent) {
                    targetContent.classList.add('active');
                }
            },

            _handleTabContent: function(tabId, options) {
                var shouldLoad = !this.tabStateManager || this.tabStateManager.shouldLoadTab(tabId, options.operation);

                if (!shouldLoad) {
                    console.debug('ℹ️ Tab', tabId, 'already loaded, skipping reload');
                    return Promise.resolve();
                }

                // Mark as loading
                if (this.tabStateManager) {
                    this.tabStateManager.setTabLoading(tabId, true);
                }

                // Handle specific tab types (simplified)
                var handlerPromise = Promise.resolve();

                if (tabId === 'manage-tab') {
                    handlerPromise = this._initializeManageTab();
                }
                // Add other tab handlers as needed

                return handlerPromise.then(function() {
                    // Mark as loaded
                    if (this.tabStateManager) {
                        this.tabStateManager.setTabLoading(tabId, false);
                    }
                    console.debug('✅ Tab', tabId, 'initialized');
                }.bind(this)).catch(function(error) {
                    console.error('Tab initialization failed:', error);
                    if (this.tabStateManager) {
                        this.tabStateManager.setTabLoading(tabId, false);
                    }
                }.bind(this));
            },

            _initializeManageTab: function() {
                return new Promise(function(resolve) {
                    // Ensure manage-tab content exists
                    var manageTabContent = document.getElementById('manage-tab');
                    if (!manageTabContent) {
                        var sidebarContent = document.querySelector('.sidebar-content');
                        if (sidebarContent) {
                            manageTabContent = document.createElement('div');
                            manageTabContent.id = 'manage-tab';
                            manageTabContent.className = 'main-tab-content';
                            sidebarContent.appendChild(manageTabContent);
                        }
                    }

                    if (manageTabContent) {
                        manageTabContent.classList.add('active');
                    }

                    // Initialize modal if available
                    if (window.tabManagerModal) {
                        window.tabManagerModal.initialize();
                        window.tabManagerModal.open(5); // Default count
                    }

                    resolve();
                });
            },

            getCurrentTab: function() {
                var activeTab = document.querySelector('.main-nav-tab.active');
                return activeTab ? activeTab.getAttribute('data-tab') : null;
            },

            isTabLoaded: function(tabId) {
                return this.tabStateManager ? this.tabStateManager.isTabLoaded(tabId) : false;
            }
        };

        // Create singleton instance
        var tabManagerInstance = null;
        window.getTabManager = function() {
            if (!tabManagerInstance) {
                tabManagerInstance = new TabManager();
            }
            return tabManagerInstance;
        };

        // Expose singleton
        window.tabContextManager = window.getTabManager();

        console.log('✅ TabManager singleton created and exposed');
    }

    // FIX 3: Create LoadingGifManager for coordinated loading state management
    if (typeof window.loadingGifManager === 'undefined') {
        console.log('🔧 Creating LoadingGifManager...');

        function LoadingGifManager() {
            this.loadingGifElement = null;
            this.showTimeout = null;
            this.hideTimeout = null;
            this.container = '.chat-messages';
            this.showDelay = 100;
            this.hideDelay = 200;
        }

        LoadingGifManager.prototype = {
            show: function() {
                // Clear pending hide
                if (this.hideTimeout) {
                    clearTimeout(this.hideTimeout);
                    this.hideTimeout = null;
                }

                // Delay showing
                this.showTimeout = setTimeout(function() {
                    this._showLoadingGif();
                    this.showTimeout = null;
                }.bind(this), this.showDelay);
            },

            hide: function() {
                // Clear pending show
                if (this.showTimeout) {
                    clearTimeout(this.showTimeout);
                    this.showTimeout = null;
                }

                // Delay hiding
                this.hideTimeout = setTimeout(function() {
                    this._hideLoadingGif();
                    this.hideTimeout = null;
                }.bind(this), this.hideDelay);
            },

            showImmediate: function() {
                if (this.showTimeout) {
                    clearTimeout(this.showTimeout);
                    this.showTimeout = null;
                }
                this._showLoadingGif();
            },

            hideImmediate: function() {
                if (this.hideTimeout) {
                    clearTimeout(this.hideTimeout);
                    this.hideTimeout = null;
                }
                this._hideLoadingGif();
            },

            _showLoadingGif: function() {
                try {
                    var container = document.querySelector(this.container);
                    if (!container) {
                        console.warn('LoadingGifManager: Container not found');
                        return;
                    }

                    // Check if already exists
                    var existing = container.querySelector('.loading-container');
                    if (existing) {
                        existing.style.display = 'flex';
                        this.loadingGifElement = existing;
                        return;
                    }

                    // Create loading gif
                    var loadingDiv = document.createElement('div');
                    loadingDiv.className = 'loading-container';
                    loadingDiv.style.cssText = [
                        'display: flex',
                        'flex-direction: column',
                        'align-items: center',
                        'justify-content: center',
                        'height: 200px',
                        'color: var(--text-secondary, #666)',
                        'font-family: var(--font-family, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif)'
                    ].join(';');

                    loadingDiv.innerHTML = [
                        '<div class="loading-spinner" style="',
                        'width: 40px;',
                        'height: 40px;',
                        'border: 3px solid var(--border-color, #e1e5e9);',
                        'border-top: 3px solid var(--accent-color, #0066cc);',
                        'border-radius: 50%;',
                        'animation: spin 1s linear infinite;',
                        'margin-bottom: 16px;',
                        '"></div>',
                        '<div style="font-size: 14px;">Loading messages...</div>',
                        '<style>@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }</style>'
                    ].join('');

                    // Insert at beginning
                    if (container.firstChild) {
                        container.insertBefore(loadingDiv, container.firstChild);
                    } else {
                        container.appendChild(loadingDiv);
                    }

                    this.loadingGifElement = loadingDiv;
                    console.debug('LoadingGifManager: Loading gif shown');

                } catch (error) {
                    console.error('LoadingGifManager: Failed to show loading gif', error);
                }
            },

            _hideLoadingGif: function() {
                try {
                    if (this.loadingGifElement) {
                        this.loadingGifElement.style.display = 'none';
                        this.loadingGifElement.remove();
                        this.loadingGifElement = null;
                        console.debug('LoadingGifManager: Loading gif hidden');
                    }
                } catch (error) {
                    console.error('LoadingGifManager: Failed to hide loading gif', error);
                }
            }
        };

        // Create singleton
        var loadingGifManagerInstance = null;
        window.getLoadingGifManager = function() {
            if (!loadingGifManagerInstance) {
                loadingGifManagerInstance = new LoadingGifManager();
            }
            return loadingGifManagerInstance;
        };

        // Expose singleton
        window.loadingGifManager = window.getLoadingGifManager();

        console.log('✅ LoadingGifManager singleton created and exposed');
    }

    // FIX 4: Ensure TabOperation enum is available
    if (typeof window.TabOperation === 'undefined') {
        window.TabOperation = {
            LOAD: 'LOAD',
            SWITCH: 'SWITCH',
            REFRESH: 'REFRESH'
        };
        console.log('✅ TabOperation enum exposed');
    }

    console.log('🎉 TAB MANAGER CRITICAL FIXES PATCH LOADED SUCCESSFULLY');
    console.log('Available globals:');
    console.log('- window.tabStateManager:', !!window.tabStateManager);
    console.log('- window.tabContextManager:', !!window.tabContextManager);
    console.log('- window.loadingGifManager:', !!window.loadingGifManager);
    console.log('- window.TabOperation:', !!window.TabOperation);

    // Auto-run diagnostic to verify fixes
    setTimeout(function() {
        if (typeof runTabManagerDiagnostics === 'function') {
            console.log('🔍 Re-running diagnostic to verify fixes...');
            runTabManagerDiagnostics();
        }
    }, 1000);

})(); // Close IIFE

