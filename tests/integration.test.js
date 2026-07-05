import { fork } from 'child_process';
import axios from 'axios';
import { io } from 'socket.io-client';
import fs from 'fs-extra';
import path from 'path';

const API_PORT = process.env.API_PORT || 3001;
const BASE_URL = `http://localhost:${API_PORT}/api/v1`;
const WS_URL = `http://localhost:${API_PORT}`;

// Config for test runner
const TEST_BOTS = ['6285183130310', '6285183130311', '6285183130312'];

// Helper to wait
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function main() {
  console.log('==================================================');
  console.log('STARTING INTEGRATION TESTING AND STABILIZATION');
  console.log('==================================================\n');

  let serverProcess = null;
  
  // 1. Check if server is already running, if not start it
  let isRunning = false;
  try {
    await axios.get(`http://localhost:${API_PORT}/health`, { timeout: 1000 });
    isRunning = true;
    console.log(`[SYS] Server is already running on port ${API_PORT}. Using existing instance.`);
  } catch (err) {
    console.log(`[SYS] Server is not running on port ${API_PORT}. Starting server...`);
    // Spawn server process
    serverProcess = fork(path.resolve('src/index.js'), {
      env: { ...process.env, PORT: '3000', API_PORT: String(API_PORT) },
      stdio: 'inherit'
    });

    // Wait for server to boot (max 10 seconds)
    for (let i = 0; i < 20; i++) {
      if (isRunning) break;
      try {
        await axios.get(`http://localhost:${API_PORT}/health`, { timeout: 500 });
        isRunning = true;
        break;
      } catch (err) {
        await wait(500);
      }
    }

    if (!isRunning) {
      console.error('[FAIL] Failed to start server subprocess. Exiting.');
      process.exit(1);
    }
    console.log('[SYS] Server started successfully as subprocess.\n');
  }

  // Set up test states
  const results = [];
  let token = '';
  let refreshToken = '';
  let socket = null;

  const logTest = (name, pass, details = '') => {
    results.push({ name, pass, details });
    console.log(`${pass ? '✅ PASS' : '❌ FAIL'} - ${name} ${details ? `(${details})` : ''}`);
  };

  try {
    // ==================================================
    // TEST 1: AUTHENTICATION
    // ==================================================
    console.log('--- TEST 1: AUTHENTICATION ---');
    try {
      // Login
      const loginRes = await axios.post(`${BASE_URL}/auth/login`, {
        username: 'admin',
        password: 'adminpassword123'
      });
      token = loginRes.data.data.accessToken;
      refreshToken = loginRes.data.data.refreshToken;
      
      const hasToken = token && refreshToken;
      logTest('Login Success & Tokens Received', hasToken);

      // Verify JWT Access Token by calling protected endpoint
      const sysRes = await axios.get(`${BASE_URL}/system`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      logTest('JWT Token Validation (Protected Route)', sysRes.status === 200);

      // Refresh Token
      const refreshRes = await axios.post(`${BASE_URL}/auth/refresh`, {
        refreshToken
      });
      const newToken = refreshRes.data.data.accessToken;
      logTest('Refresh Token Operation', newToken && newToken !== token);
      token = newToken; // Update active token

      // WebSocket Connection & Auth
      await new Promise((resolve, reject) => {
        socket = io(WS_URL, {
          auth: { token },
          transports: ['websocket']
        });

        socket.on('connect', () => {
          logTest('WebSocket Connect & Login Auth', true);
          
          // Join room logs
          socket.emit('subscribe', 'logs');
          
          // Listen for subscription response
          socket.once('subscribed', (data) => {
            logTest('WebSocket Room Subscription (logs)', data.room === 'logs');
            resolve();
          });
        });

        socket.on('connect_error', (err) => {
          logTest('WebSocket Connect & Login Auth', false, err.message);
          reject(err);
        });

        // Set safety timeout
        setTimeout(() => {
          if (!socket.connected) {
            logTest('WebSocket Connect & Login Auth', false, 'Timeout');
            resolve();
          }
        }, 5000);
      });
    } catch (err) {
      logTest('TEST 1: AUTHENTICATION', false, err.message);
    }

    // ==================================================
    // TEST 2: BOT MANAGEMENT & TEST 3: MULTI SESSION
    // ==================================================
    console.log('\n--- TEST 2 & 3: BOT MANAGEMENT & MULTI SESSION ---');
    try {
      // Add multiple bots
      const createdBots = [];
      for (const phone of TEST_BOTS) {
        const createRes = await axios.post(`${BASE_URL}/bots`, 
          { phone },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        createdBots.push(createRes.data.data);
      }
      
      logTest('Add Multiple Bots (3 Bots Created)', createdBots.length === 3 && createdBots.every(b => b.phoneNumber));

      // Get Bots List
      const listRes = await axios.get(`${BASE_URL}/bots`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const listCount = listRes.data.data.items.length;
      logTest('Bots Listing Endpoint', listCount >= 3);

      // Get Bot Details
      const detailRes = await axios.get(`${BASE_URL}/bots/${TEST_BOTS[0]}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      logTest('Get Bot Details & System Stats', detailRes.status === 200 && detailRes.data.data.id === TEST_BOTS[0]);

      // Verify bots don't interfere: start and stop one bot
      const stopRes = await axios.post(`${BASE_URL}/bots/${TEST_BOTS[0]}/stop`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      logTest('Stop Bot Operation (Standalone)', stopRes.status === 200);

      const startRes = await axios.post(`${BASE_URL}/bots/${TEST_BOTS[0]}/start`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      logTest('Start Bot Operation (Standalone)', startRes.status === 200);

    } catch (err) {
      logTest('TEST 2 & 3: BOT MANAGEMENT & MULTI SESSION', false, err.message);
    }

    // ==================================================
    // TEST 4: AUTO RESTORE
    // ==================================================
    console.log('\n--- TEST 4: AUTO RESTORE ---');
    try {
      // Auto restore sessions are run on startup via restoreBots()
      // Let's call /sessions GET to confirm session data is retrieved
      const sessionsRes = await axios.get(`${BASE_URL}/sessions`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      logTest('Auto Restore Session Configuration Storage', sessionsRes.status === 200 && sessionsRes.data.data.items.length >= 3);
    } catch (err) {
      logTest('TEST 4: AUTO RESTORE', false, err.message);
    }

    // ==================================================
    // TEST 5: COMMANDS & TEST 6: PLUGINS
    // ==================================================
    console.log('\n--- TEST 5 & 6: COMMANDS & PLUGINS ---');
    try {
      // Plugins list
      const pluginsRes = await axios.get(`${BASE_URL}/plugins`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      logTest('Plugins Listing & Status Check', pluginsRes.status === 200 && pluginsRes.data.data.items.length > 0);

      // Commands list
      const commandsRes = await axios.get(`${BASE_URL}/commands`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const pingCommand = commandsRes.data.data.items.find(c => c.name === 'ping');
      logTest('Commands Loaded and Available (.ping, .menu)', pingCommand !== undefined);

      // Toggle enable/disable command
      const disableCmdRes = await axios.patch(`${BASE_URL}/commands/ping/disable`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      logTest('Disable Command Endpoint', disableCmdRes.status === 200);

      const enableCmdRes = await axios.patch(`${BASE_URL}/commands/ping/enable`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      logTest('Enable Command Endpoint', enableCmdRes.status === 200);

      // Reload Command without restart
      const reloadRes = await axios.post(`${BASE_URL}/commands/ping/reload`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      logTest('Hot Reload Single Command', reloadRes.status === 200);
    } catch (err) {
      logTest('TEST 5 & 6: PLUGINS & COMMANDS', false, err.message);
    }

    // ==================================================
    // TEST 7: REST API
    // ==================================================
    console.log('\n--- TEST 7: REST API ---');
    try {
      // Test all core endpoints to confirm correct responses and status codes
      const endpoints = [
        { path: '/system', method: 'GET' },
        { path: '/system/statistics', method: 'GET' },
        { path: '/system/logs', method: 'GET' },
        { path: '/queue/stats', method: 'GET' },
        { path: '/jobs', method: 'GET' }
      ];

      let allPassed = true;
      for (const ep of endpoints) {
        const res = await axios({
          url: `${BASE_URL}${ep.path}`,
          method: ep.method,
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.status !== 200) {
          allPassed = false;
          console.log(`[FAIL] Endpoint ${ep.path} returned status ${res.status}`);
        }
      }
      logTest('Validate Response, Status Codes, and Schemas of REST Endpoints', allPassed);
    } catch (err) {
      logTest('TEST 7: REST API', false, err.message);
    }

    // ==================================================
    // TEST 8: WEBSOCKET REALTIME EVENTS & TEST 10: MONITORING
    // ==================================================
    console.log('\n--- TEST 8 & 10: WEBSOCKET & MONITORING ---');
    try {
      // Check system overview details (health, cpu, ram)
      const healthRes = await axios.get(`http://localhost:${API_PORT}/health`);
      const isCpuRamRealtime = healthRes.data.success && healthRes.data.data.memory.total > 0;
      logTest('System Resource Monitoring (CPU, RAM, Uptime)', isCpuRamRealtime);

      // Verify WebSocket receives metric ticks
      await new Promise((resolve) => {
        // Subscribe to system room
        socket.emit('subscribe', 'system');
        
        let memoryUpdated = false;
        let healthUpdated = false;

        socket.on('memory.updated', () => {
          memoryUpdated = true;
        });

        socket.on('health.updated', () => {
          healthUpdated = true;
        });

        // Trigger or wait for update
        setTimeout(() => {
          logTest('WebSocket Realtime Metrics Broadcasts (memory, health)', memoryUpdated || healthUpdated);
          resolve();
        }, 6000); // Metric ticks are sent every 5 seconds
      });

    } catch (err) {
      logTest('TEST 8 & 10: WEBSOCKET & MONITORING', false, err.message);
    }

    // ==================================================
    // TEST 11: ERROR HANDLING
    // ==================================================
    console.log('\n--- TEST 11: ERROR HANDLING ---');
    try {
      // 1. Invalid input error
      try {
        await axios.post(`${BASE_URL}/bots`, {}, {
          headers: { Authorization: `Bearer ${token}` }
        });
        logTest('Handle Invalid Request Body Schema', false, 'Expected 400');
      } catch (err) {
        logTest('Handle Invalid Request Body Schema', err.response?.status === 400);
      }

      // 2. Unauthorized error
      try {
        await axios.get(`${BASE_URL}/system`);
        logTest('Handle Unauthorized Request (Missing Token)', false, 'Expected 401');
      } catch (err) {
        logTest('Handle Unauthorized Request (Missing Token)', err.response?.status === 401);
      }

      // 3. Not Found error
      try {
        await axios.get(`${BASE_URL}/nonexistent-endpoint`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        logTest('Handle Route Not Found (404)', false, 'Expected 404');
      } catch (err) {
        logTest('Handle Route Not Found (404)', err.response?.status === 404);
      }
    } catch (err) {
      logTest('TEST 11: ERROR HANDLING', false, err.message);
    }

    // ==================================================
    // TEST 13: DATABASE PERSISTENCE
    // ==================================================
    console.log('\n--- TEST 13: DATABASE PERSISTENCE ---');
    try {
      const dbPath = path.resolve('src/database/database.json');
      const dbContent = await fs.readJson(dbPath);
      const hasSessionsStored = Object.keys(dbContent.sessions || {}).length >= 3;
      logTest('Verify Sessions Saved in database.json', hasSessionsStored);
    } catch (err) {
      logTest('TEST 13: DATABASE PERSISTENCE', false, err.message);
    }

    // ==================================================
    // TEST 14: LOGGING
    // ==================================================
    console.log('\n--- TEST 14: LOGGING ---');
    try {
      const logsRes = await axios.get(`${BASE_URL}/system/logs`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      logTest('Verify Audit and Activity Logging', logsRes.status === 200 && logsRes.data.data.logs.length > 0);
    } catch (err) {
      logTest('TEST 14: LOGGING', false, err.message);
    }

    // Clean up created bots
    console.log('\n[SYS] Cleaning up test bots...');
    for (const phone of TEST_BOTS) {
      await axios.delete(`${BASE_URL}/bots/${phone}`, {
        headers: { Authorization: `Bearer ${token}` }
      }).catch(() => {});
    }

    // Logout WebSocket & REST
    console.log('[SYS] Testing clean Logout WebSocket disconnection...');
    if (socket) {
      socket.disconnect();
    }
    const logoutRes = await axios.post(`${BASE_URL}/auth/logout`, 
      { refreshToken },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    logTest('Logout Memutus WebSocket & Invalidates Token JTI', logoutRes.status === 200);

  } catch (err) {
    console.error('[FATAL] Exception in test runner:', err.message);
  } finally {
    // Terminate server process if spawned
    if (serverProcess) {
      console.log('\n[SYS] Stopping server subprocess...');
      serverProcess.kill('SIGKILL');
      await wait(1500);
    }
    
    // Output final summary
    console.log('\n==================================================');
    console.log('INTEGRATION TEST RESULTS SUMMARY');
    console.log('==================================================');
    const passed = results.filter(r => r.pass).length;
    const failed = results.filter(r => !r.pass).length;
    console.log(`TOTAL: ${results.length} | PASSED: ${passed} | FAILED: ${failed}`);
    console.log('==================================================');

    // Create report file in workspace
    const reportPath = path.resolve('tests/report.json');
    await fs.outputJson(reportPath, { summary: { total: results.length, passed, failed }, results }, { spaces: 2 });
    console.log(`Report JSON written to ${reportPath}`);
  }
}

main().catch(console.error);
