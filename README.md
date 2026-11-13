# 🔬 FundTheLab — Decentralized Micro-Grants for Breakthrough Science

> **Built for the Pollar Web3 Hackathon on Stellar & Soroban**

[![Built on Stellar](https://img.shields.io/badge/Blockchain-Stellar%20Soroban-0052cc)](https://stellar.org)
[![Onboarding via Pollar](https://img.shields.io/badge/Onboarding-Pollar%20SDK-00D2BA)](https://pollar.xyz)
[![Backend: Express](https://img.shields.io/badge/Backend-Express%20%2B%20TypeScript-black)](https://expressjs.com)
[![Database: SQLite WAL](https://img.shields.io/badge/Database-SQLite%20(better--sqlite3)-003B57)](https://sqlite.org)
[![Zero Gas](https://img.shields.io/badge/Fees-Sponsored%20Gasless-10b981)](#)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

---

## 🌟 The Vision

**FundTheLab** is a full-stack Decentralized Science (DeSci) crowdfunding platform connecting university labs, student researchers, and independent scientific initiatives directly with global donors, alumni, and industry sponsors.

### The Problem
* **Bureaucracy**: Traditional academic grants (NIH, NSF, Horizon) take **6 to 18 months** to review.
* **Overhead Skim**: Universities routinely deduct **30% to 50%** of grant funds for administrative "indirect costs".
* **Neglected Micro-Grants**: Small grants between **$500 and $5,000**—the exact amounts junior researchers need for reagents, compute, or clinical trials—are ignored by legacy grant bodies.
* **Paywalls**: Publicly-funded science ends up trapped behind publisher paywalls.

### The Solution with Stellar & Pollar
1. **0% University Overhead**: 100% of donor USDC flows directly into research work.
2. **Milestone-Guarded Escrow**: Funds are locked in smart escrow contracts on Stellar Soroban, released proportionally as researchers upload verifiable open data/preprints.
3. **1-Click Google Login via Pollar**: Donors and researchers onboard in seconds without managing 12-word seed phrases.
4. **Gasless Payments**: Transaction fees are sponsored by Pollar so users don't need XLM to donate USDC.
5. **Persistent On-Chain / Off-Chain Data Sync**: Node.js/Express server backed by an optimized SQLite database with live Stellar Horizon testnet RPC queries.

---

## 🏛️ Architecture & Full-Stack Breakdown

```
┌────────────────────────────────────────────────────────┐
│                   Frontend (React 18)                  │
│       Vite 5 • Tailwind CSS • Lucide • Confetti        │
│  Pollar Embedded Wallet (@pollar/react & @pollar/core) │
└───────────────────────────┬────────────────────────────┘
                            │ /api requests (Vite Proxy)
                            ▼
┌────────────────────────────────────────────────────────┐
│               Backend API (Express + TS)               │
│               Port 3001 • Horizon Client               │
└─────────────┬────────────────────────────┬─────────────┘
              │                            │
              ▼                            ▼
┌───────────────────────────┐ ┌──────────────────────────┐
│   SQLite Database (WAL)   │ │  Stellar Network Horizon │
│  Campaigns • Milestones   │ │  Testnet RPC & Accounts  │
│  Escrow Ledger Donations  │ │  @stellar/stellar-sdk    │
└───────────────────────────┘ └──────────────────────────┘
```

---

## 🛠️ Complete Technology Stack

| Layer | Technologies | Role in Project |
| :--- | :--- | :--- |
| **Frontend Framework** | **React 18 & Vite 5** | High-performance SPA with client-side routing, modals, and responsive layout. |
| **Styling & Design** | **Tailwind CSS 3.4 & Lucide Icons** | Custom glassmorphism, responsive scientific dashboard theme, badges, and counters. |
| **Web3 / Auth SDK** | **`@pollar/react` & `@pollar/core`** | Pollar embedded wallet, Google & Passkey social login, and gasless fee sponsorship. |
| **Backend Server** | **Express.js & TypeScript (`tsx`)** | REST API for campaigns, milestone unlock requests, and donation ledger persistence. |
| **Persistent Database** | **SQLite (`better-sqlite3`)** | High-performance ACID storage with WAL (Write-Ahead Logging) for campaigns, milestones, and on-chain tx receipts. |
| **Stellar SDK** | **`@stellar/stellar-sdk`** | Connects to Stellar Horizon Testnet to query live accounts and network health. |
| **Visual Effects** | **Canvas Confetti** | Celebration animation on micro-grant confirmations and milestone releases. |

---

## 🔌 REST API Endpoints

* `GET /api/campaigns` — Fetch all research campaigns with nested milestone escrows.
* `GET /api/campaigns/:id` — Fetch detailed campaign profile and milestone proofs.
* `POST /api/campaigns` — Register a new university lab proposal with custom milestones.
* `POST /api/campaigns/:id/donate` — Record a USDC donation, update raised totals, and log to ledger.
* `POST /api/campaigns/:id/milestones/:mId/verify` — Verify research proof and release escrow tranche.
* `GET /api/donations` — Fetch live on-chain escrow transaction feed.
* `GET /api/stellar/health` — Check live Stellar Horizon testnet connection.
* `GET /api/stellar/account/:address` — Query Stellar account balance and sequence.

---

## ⚡ Quickstart

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Backend & Database
```bash
npm run server
```
*Initializes `server/data/fundthelab.db` and starts Express at [http://localhost:3001](http://localhost:3001).*

### 3. Start Frontend Client
In a second terminal:
```bash
npm run dev
```
*Open [http://localhost:5173](http://localhost:5173) in your browser.*

### 4. Build for Production
```bash
npm run build
```

---

## 📄 Documentation

* Detailed Architecture & Web3 DeSci Guide: [FundTheLab_Overview.md](FundTheLab_Overview.md)
* Formatted Executive Brief (Word Document): [FundTheLab_Overview.docx](FundTheLab_Overview.docx)
