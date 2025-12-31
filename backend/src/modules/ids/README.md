# Rule-Based Intrusion Detection System (IDS)

## Overview

This module implements a deterministic, rule-based Intrusion Detection System (IDS) for educational purposes. It analyzes uploaded system logs or raw log text to detect security threats and suspicious patterns without using machine learning or AI models.

The IDS is designed to operate without database dependency, performing stateless analysis per request, which allows independent development and easy future integration into a persistent backend.

## Features

- **100% Rule-Based Detection**: No ML/AI, only heuristic rules
- **Multiple Log Format Support**: CSV, TXT, and LOG files
- **File Upload or JSON Input**: Flexible API design
- **5 Core Detection Rules**:
  1. Brute-force attack detection
  2. Unusual access time detection
  3. Suspicious IP behavior detection
  4. Data exfiltration detection
  5. General anomaly detection

## Installation

### Prerequisites

Ensure you have Node.js and npm installed.

### Required Dependencies

Install the following packages from the project root:

```bash
npm install multer
npm install --save-dev @types/multer
```

These packages are free and open-source:
- **multer**: For handling file uploads (MIT License)
- **@types/multer**: TypeScript type definitions

## Architecture

```
backend/src/modules/ids/
├── ids.code.ts            # IDS logic, rules, parsing, and API endpoint
└── IDS-DOCUMENTATION.md   # This file
```

## Design Rationale

A single controller file is used to ensure:
- Clear rule traceability
- Simpler educational understanding
- Independence from database or external services

Detection logic is grouped into clearly labeled sections:
- Parsing
- Rule detection
- Analysis orchestration
- API handling

## API Documentation

### Endpoint

**POST** `/api/ids/analyze-logs`

### Request Formats

#### Option 1: File Upload (multipart/form-data)

```bash
curl -X POST http://localhost:4000/api/ids/analyze-logs \
  -F "file=@path/to/logfile.csv"
```

**Supported file types**: `.csv`, `.txt`, `.log`
**Maximum file size**: 10 MB

#### Option 2: JSON Payload (application/json)

```bash
curl -X POST http://localhost:4000/api/ids/analyze-logs \
  -H "Content-Type: application/json" \
  -d '{
    "content": "2024-01-15 09:15:33 WARNING - Login failed for user bob.jones\n2024-01-15 09:15:45 WARNING - Login failed for user bob.jones"
  }'
```

### Response Format

```json
{
  "success": true,
  "analysis": {
    "totalLogLines": 33,
    "parsedEntries": 32,
    "findingsCount": 5,
    "analysisTimestamp": "2024-01-16T10:30:45.123Z"
  },
  "findings": [
    {
      "id": "IDS-1705402245123-a1b2c3d4",
      "title": "Brute-Force Attack Detected on User: bob.jones",
      "description": "Detected 6 failed login attempts for user \"bob.jones\". This pattern indicates a potential brute-force attack...",
      "severity": "High",
      "category": "Intrusion Detection",
      "recommendation": "Immediately lock account \"bob.jones\" and require password reset. Implement account lockout policies..."
    }
  ]
}
```

### Vulnerability Object Structure

Each finding contains:

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Unique identifier for the finding |
| `title` | string | Short summary of the threat |
| `description` | string | Detailed explanation of what was detected |
| `severity` | string | One of: "Critical", "High", "Medium", "Low" |
| `category` | string | Always "Intrusion Detection" |
| `recommendation` | string | Actionable steps to mitigate the threat |

## Detection Rules

### Rule 1: Brute-Force Attack Detection

**Trigger**: ≥5 failed login attempts from the same user or IP address

**Logic**:
- Tracks failed authentication events
- Counts failures per username and per IP
- Generates "Critical" severity if ≥10 attempts, "High" if ≥5

**Example Pattern**:
```
09:15:33 - Login failed for user bob.jones
09:15:45 - Login failed for user bob.jones
09:16:01 - Login failed for user bob.jones
... (5+ times)
```

### Rule 2: Unusual Access Time Detection

**Trigger**: Login events outside working hours (8 AM - 6 PM)

**Logic**:
- Parses timestamps from log entries
- Checks if hour is < 8 or ≥ 18
- Flags users with ≥2 after-hours logins

**Example Pattern**:
```
22:15:45 - User admin logged in (10 PM)
02:30:15 - User charlie.brown logged in (2 AM)
```

### Rule 3: Suspicious IP Behavior Detection

**Trigger**: IP with ≥10 access attempts AND ≥3 suspicious events

**Logic**:
- Counts total requests per IP
- Identifies suspicious events (errors, denials, blocks)
- Correlates high activity with suspicious patterns

**Example Pattern**:
```
203.0.113.45 - 15 total requests
203.0.113.45 - 7 failed login attempts
203.0.113.45 - 2 blocked access attempts
```

### Rule 4: Data Exfiltration Detection

**Trigger**: User transfers ≥100 MB of data

**Logic**:
- Parses data size from log entries
- Aggregates total bytes transferred per user
- Flags transfers exceeding threshold

**Example Pattern**:
```
alice.smith - Uploaded data export (150 MB)
charlie.brown - Downloaded large file (500 MB)
```

### Rule 5: General Anomaly Detection

**Trigger**: ≥5 error events from a single source

**Logic**:
- Identifies ERROR and CRITICAL log levels
- Groups by username or IP
- Detects unusual error patterns

**Example Pattern**:
```
198.51.100.23 - SQL injection attempt (ERROR)
198.51.100.23 - Path traversal attempt (ERROR)
198.51.100.23 - XSS attempt (ERROR)
... (5+ times)
```

## Log Format Support

### CSV Format

**Expected columns**: timestamp, level, username, ip, action, status, message, dataSize

```csv
timestamp,level,username,ip,action,status,message,dataSize
2024-01-15T08:30:15.000Z,INFO,john.doe,192.168.1.100,login,success,User logged in,
2024-01-15T09:15:33.000Z,WARNING,bob.jones,192.168.1.102,login,failed,Invalid password,
```

The parser automatically detects column positions - column order doesn't matter.

### Text/Log Format

**Pattern matching** extracts fields from unstructured logs:

```
[2024-01-15 08:30:15] INFO - User john.doe logged in from 192.168.1.100
[2024-01-15 09:15:33] WARNING - Login failed for user bob.jones from 192.168.1.102
```

Supported patterns:
- **Timestamps**: ISO 8601, MM/DD/YYYY HH:MM:SS, syslog format
- **Log levels**: DEBUG, INFO, WARN, ERROR, CRITICAL
- **Users**: `user: username`, `username=value`
- **IPs**: Standard IPv4 format (xxx.xxx.xxx.xxx)
- **Actions**: login, logout, access, upload, download
- **Status**: success, failed, denied, authorized

## Testing

### Using Example Files

Test with provided example files:

```bash
# CSV format
curl -X POST http://localhost:4000/api/ids/analyze-logs \
  -F "file=@backend/src/modules/ids/example-logs.csv"

# Text format
curl -X POST http://localhost:4000/api/ids/analyze-logs \
  -F "file=@backend/src/modules/ids/example-logs.txt"
```

### Expected Findings from Example Logs

The example files should detect:

1. **Brute-force attack** from user "bob.jones" (6 failed logins)
2. **Brute-force attack** from IP "203.0.113.45" (7 failed logins)
3. **After-hours access** by users "admin" and "charlie.brown"
4. **Data exfiltration** by "alice.smith" (150 MB) and "charlie.brown" (500 MB)
5. **Suspicious IP activity** from "198.51.100.23" and "203.0.113.45"
6. **Error anomalies** from IP "198.51.100.23" (6 error events)

### Using Postman or Thunder Client

**Request Configuration**:
- Method: POST
- URL: `http://localhost:4000/api/ids/analyze-logs`
- Body Type: form-data
- Key: `file` (type: File)
- Value: Select your log file

## Configuration

### Adjusting Detection Thresholds

Edit [ids.service.ts](ids.service.ts) to customize sensitivity:

```typescript
// In IDSService class
private readonly BRUTE_FORCE_THRESHOLD = 5;          // Failed login threshold
private readonly SUSPICIOUS_EVENT_THRESHOLD = 3;     // Suspicious event count
private readonly DATA_EXFILTRATION_THRESHOLD = 100 * 1024 * 1024;  // 100 MB
private readonly UNKNOWN_IP_THRESHOLD = 10;          // IP access count
private readonly WORK_HOURS_START = 8;               // 8 AM
private readonly WORK_HOURS_END = 18;                // 6 PM
```

## Educational Use Cases

This IDS module is designed for:

1. **Cybersecurity Training**: Teaching log analysis fundamentals
2. **Threat Detection Labs**: Hands-on practice with real log patterns
3. **Incident Response Exercises**: Identifying security events
4. **Audit Simulations**: Demonstrating compliance monitoring
5. **Penetration Testing**: Understanding defensive detection capabilities

## Limitations (By Design)

- **No Machine Learning**: Uses only deterministic rules
- **No Real-time Monitoring**: Analyzes uploaded logs, not live streams
- **No Database**: Stateless analysis per request
- **Limited Context**: Each log file analyzed independently
- **Simple Heuristics**: May produce false positives/negatives

These limitations are intentional for educational clarity.

## Security Considerations

- File uploads limited to 10 MB to prevent DoS
- Only accepts `.csv`, `.txt`, `.log` file extensions
- Files stored in memory (not disk) and discarded after analysis
- No sensitive data persisted
- Input validation on all endpoints

## Error Handling

### Common Errors

**400 Bad Request**:
```json
{
  "error": "Bad Request",
  "message": "Please provide either a log file or JSON with 'content' field."
}
```

**413 File Too Large**:
```json
{
  "error": "File Too Large",
  "message": "File size exceeds the 10 MB limit."
}
```

**500 Internal Server Error**:
```json
{
  "error": "Internal Server Error",
  "message": "An error occurred while analyzing the logs."
}
```

## Extending the IDS

### Adding New Detection Rules

1. Create a new method in [ids.service.ts](ids.service.ts):

```typescript
private detectNewRule(entries: LogEntry[]): Vulnerability[] {
  const findings: Vulnerability[] = [];

  // Your detection logic here

  return findings;
}
```

2. Call the method in `analyzeLogs()`:

```typescript
findings.push(...this.detectNewRule(logEntries));
```

### Adding New Log Formats

Extend [log-parser.ts](log-parser.ts) with new parsing methods:

```typescript
private parseCustomFormat(lines: string[]): LogEntry[] {
  // Your parsing logic
}
```

## Support and Contribution

This is an educational module for the AmanTech Shield platform.

For issues or questions:
1. Review this documentation
2. Check the inline code comments
3. Test with provided example files
4. Verify dependencies are installed

## License

This module is part of the AmanTech Shield educational platform.
All dependencies are free and open-source.

---

**Last Updated**: 2024-01-16
**Version**: 1.0.0
**Author**: AmanTech Shield Development Team
