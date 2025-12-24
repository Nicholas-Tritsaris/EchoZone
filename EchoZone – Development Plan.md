---
created: 2025-12-24T11:13:06+11:00
modified: 2025-12-24T11:14:22+11:00
---

# EchoZone – Development Plan

# EchoZone – Development Plan

## 1. Project Overview

EchoZone is a location-based, anonymous social media platform inspired by Yik Yak. The goal is to support iOS, Android, and Windows Phone through a single shared core application, while maintaining broad OS compatibility and minimizing long-term maintenance costs.

Primary design principle:
**One core app, multiple thin platform wrappers.**

---

## 2. Platform Targets

### Supported Platforms

* **iOS:** iOS 12 → latest
* **Android:** Android 5.0 (API 21) → latest
* **Windows Phone 7:** Silverlight (separate legacy build)
* **Windows Phone 10:** UWP (separate build)

### Distribution

* Apple App Store
* Google Play Store
* Windows Phone Store (legacy / archival)

---

## 3. Architecture Summary

### Core Strategy

* Web-first application (HTML + CSS + JavaScript)
* Shared backend (single API)
* Platform-specific native wrappers using WebView controls

This ensures:

* Maximum OS compatibility
* One primary UI codebase
* Centralized logic and moderation

---

## 4. Frontend (Core App)

### Technology

* HTML5
* CSS3 (flexbox, responsive layout)
* JavaScript (ES5-compatible)
* No heavy frameworks required

### Responsibilities

* Rendering the feed
* Posting content
* Voting and reporting
* Handling location permissions
* Polling for updates

### Progressive Enhancement

* Base experience works everywhere
* Advanced features enabled only on capable devices

---

## 5. Backend

### Technology Options

* Node.js + Express (preferred)
* Firebase (alternative)

### Core Services

* Anonymous user token issuance
* Post creation and retrieval
* Geo-radius filtering
* Vote aggregation
* Report handling
* Rate limiting

### Data Storage

* Posts
* Votes
* Reports
* Device tokens (anonymized)

---

## 6. Anonymity Model

* No usernames or profiles
* Device-based anonymous UUID
* Periodic token rotation
* No persistent personal identifiers
* Server-side abuse detection

---

## 7. Moderation & Safety

### Automated

* Rate limiting per device
* Keyword filtering
* Spam detection

### Manual

* Admin moderation dashboard
* Post removal
* Temporary geo-bans

---

## 8. Platform Wrappers

### iOS

* Objective-C / Swift
* WKWebView
* Minimal native logic

### Android

* Java
* Android WebView
* Backward-compatible configuration

### Windows Phone 7

* Silverlight
* WebBrowser control
* Limited feature set

### Windows Phone 10

* UWP WebView
* Feature parity where possible

---

## 9. MVP Feature Set

* Local text feed
* Anonymous posting
* Upvote / downvote
* Report content
* Manual refresh

---

## 10. Future Enhancements

* Real-time updates (WebSockets)
* Push notifications (iOS / Android)
* Optional map view
* Admin analytics
* Gradual deprecation of legacy platforms

---

## 11. Development Phases

### Phase 1 – Foundation

* Backend API
* Database schema
* Core web UI

### Phase 2 – Mobile Wrappers

* iOS wrapper
* Android wrapper

### Phase 3 – Windows Phone

* WP7 legacy app
* WP10 UWP app

### Phase 4 – Moderation & Scaling

* Abuse controls
* Performance optimization

---

## 12. Success Criteria

* One shared codebase for UI
* Stable operation across all target OS versions
* Acceptable performance on low-end devices
* Maintainable long-term architecture

---

## 13. Status

Planning phase
