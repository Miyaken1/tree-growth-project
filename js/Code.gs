/**
 * Google Apps Script API for Manus AI Project
 * Handles count, breakdown, and config actions with CORS support
 */

function doGet(e) {
  return handleRequest(e);
}

function doPost(e) {
  return handleRequest(e);
}

function doOptions(e) {
  // Handle preflight CORS requests
  return ContentService
    .createTextOutput('')
    .setMimeType(ContentService.MimeType.TEXT)
    .setHeaders({
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    });
}

function handleRequest(e) {
  try {
    const action = e.parameter.action;
    const method = e.method || 'GET';
    
    let response;
    
    switch (action) {
      case 'count':
        response = handleCount();
        break;
      case 'breakdown':
        response = handleBreakdown();
        break;
      case 'config':
        if (method === 'GET') {
          response = handleConfigGet(e.parameter.pw);
        } else if (method === 'POST') {
          response = handleConfigPost(e.parameter.pw, e.postData);
        } else {
          response = { error: 'Method not allowed' };
        }
        break;
      default:
        response = { error: 'Invalid action' };
    }
    
    return ContentService
      .createTextOutput(JSON.stringify(response))
      .setMimeType(ContentService.MimeType.JSON)
      .setHeaders({
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
      });
      
  } catch (error) {
    const errorResponse = { error: error.toString() };
    return ContentService
      .createTextOutput(JSON.stringify(errorResponse))
      .setMimeType(ContentService.MimeType.JSON)
      .setHeaders({
        'Access-Control-Allow-Origin': '*'
      });
  }
}

/**
 * Handle count action - returns count of responses within configured period
 */
function handleCount() {
  try {
    const configSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('config');
    const responsesSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('responses');
    
    if (!configSheet || !responsesSheet) {
      return { error: 'Required sheets not found' };
    }
    
    // Get period configuration
    const configData = configSheet.getDataRange().getValues();
    const config = {};
    for (let i = 1; i < configData.length; i++) {
      config[configData[i][0]] = configData[i][1];
    }
    
    const startDate = new Date(config['period.start']);
    const endDate = new Date(config['period.end']);
    const currentDate = new Date();
    
    // Count responses within period
    const responseData = responsesSheet.getDataRange().getValues();
    let count = 0;
    
    for (let i = 1; i < responseData.length; i++) {
      const responseDate = new Date(responseData[i][0]); // Assuming first column is date
      if (responseDate >= startDate && responseDate <= endDate && responseDate <= currentDate) {
        count++;
      }
    }
    
    return { count: count };
    
  } catch (error) {
    return { error: 'Failed to get count: ' + error.toString() };
  }
}

/**
 * Handle breakdown action - returns grouped data by organization and role
 */
function handleBreakdown() {
  try {
    const responsesSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('responses');
    
    if (!responsesSheet) {
      return { error: 'Responses sheet not found' };
    }
    
    const data = responsesSheet.getDataRange().getValues();
    const breakdown = {};
    
    // Assuming columns: Date, Organization, Role, ...
    for (let i = 1; i < data.length; i++) {
      const org = data[i][1] || 'Unknown';
      const role = data[i][2] || 'Unknown';
      const key = `${org}_${role}`;
      
      if (!breakdown[key]) {
        breakdown[key] = {
          organization: org,
          role: role,
          count: 0
        };
      }
      breakdown[key].count++;
    }
    
    return { breakdown: Object.values(breakdown) };
    
  } catch (error) {
    return { error: 'Failed to get breakdown: ' + error.toString() };
  }
}

/**
 * Handle config GET - returns configuration if password hash matches
 */
function handleConfigGet(passwordHash) {
  try {
    const configSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('config');
    
    if (!configSheet) {
      return { error: 'Config sheet not found' };
    }
    
    const data = configSheet.getDataRange().getValues();
    const config = {};
    
    for (let i = 1; i < data.length; i++) {
      config[data[i][0]] = data[i][1];
    }
    
    // Check password hash (in real implementation, store hashed password in config)
    const storedHash = config['password.hash'] || 'default_hash';
    
    if (passwordHash !== storedHash) {
      return { error: 'Unauthorized', status: 401 };
    }
    
    return { config: config };
    
  } catch (error) {
    return { error: 'Failed to get config: ' + error.toString() };
  }
}

/**
 * Handle config POST - updates configuration if password hash matches
 */
function handleConfigPost(passwordHash, postData) {
  try {
    const configSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('config');
    
    if (!configSheet) {
      return { error: 'Config sheet not found' };
    }
    
    // Get current config to check password
    const currentData = configSheet.getDataRange().getValues();
    const currentConfig = {};
    
    for (let i = 1; i < currentData.length; i++) {
      currentConfig[currentData[i][0]] = currentData[i][1];
    }
    
    const storedHash = currentConfig['password.hash'] || 'default_hash';
    
    if (passwordHash !== storedHash) {
      return { error: 'Unauthorized', status: 401 };
    }
    
    // Parse new configuration
    const newConfig = JSON.parse(postData.contents);
    
    // Clear existing config (keep headers)
    configSheet.getRange(2, 1, configSheet.getLastRow() - 1, 2).clearContent();
    
    // Write new config
    const configEntries = Object.entries(newConfig);
    for (let i = 0; i < configEntries.length; i++) {
      configSheet.getRange(i + 2, 1).setValue(configEntries[i][0]);
      configSheet.getRange(i + 2, 2).setValue(configEntries[i][1]);
    }
    
    return { status: 'ok' };
    
  } catch (error) {
    return { error: 'Failed to update config: ' + error.toString() };
  }
}

// Test example:
// curl -X GET "https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec?action=count"
// curl -X GET "https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec?action=breakdown"
// curl -X GET "https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec?action=config&pw=HASHED_PASSWORD"
// curl -X POST "https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec?action=config&pw=HASHED_PASSWORD" -d '{"key":"value"}'

