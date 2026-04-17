# Personal-Cloud-Storage
🚀 CloudVault: Full-Stack Azure & Supabase Storage Solution
A modern, secure file management dashboard built with React, .NET 10, and Azure Cloud Services. This project demonstrates a decoupled architecture using Direct-to-Cloud uploads via Azure SAS tokens, ensuring high performance and reduced server overhead.

🌟 Key Features
Direct-to-Azure Uploads: Uses Shared Access Signatures (SAS) to securely upload files directly from the browser to Azure Blob Storage.

Hybrid Cloud Backend: Combines Azure for heavy lifting (storage) and Supabase for lighting-fast metadata management and Auth.

Secure Authentication: Integrated with Supabase Auth (JWT) to ensure users can only access their own files.

Type-Safe API: A robust .NET Minimal API designed with DTOs and clean serialization.

Real-time Dashboard: Responsive React UI with instant file listing, storage allocation tracking, and status updates.

🛠️ Tech Stack
Frontend: React (Vite), Tailwind CSS, Lucide Icons.

Backend: .NET 10 (C#), Minimal APIs, Supabase-csharp.

Cloud Infrastructure:

Azure Blob Storage: Object storage for file persistence.

Supabase (PostgreSQL): Relational database for file metadata and RLS policies.

Supabase Auth: Identity management.

🏗️ The Architecture
To optimize for scale, this application bypasses the traditional "proxy" upload method (where files go through the API). Instead:

React requests a time-limited SAS Token from the .NET API.

React uploads the file directly to Azure.

React notifies the API to record the successful upload in Supabase.

🚀 Getting Started
Prerequisites
.NET 10 SDK

Node.js (v18+)

Azure Storage Account

Supabase Project

Setup
Clone the repo

Configure Backend: * Rename appsettings.Example.json to appsettings.json.

Fill in your Azure Connection String and Supabase Service Role Key.

Install Frontend:

Bash
cd FrontEnd && npm install
Run Concurrently:
Use two terminals:

dotnet run (in /BackEnd)

npm run dev (in /FrontEnd)
