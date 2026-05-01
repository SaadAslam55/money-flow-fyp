Money Flow Business Management System
Final Year Project
Session 2022-2026


A project submitted in partial fulfilment of the requirements for the Degree
of 
BS in Software Engineering 

 

Department of Computer Science
COMSATS University Islamabad (CUI), Lahore Campus

 
Project Details
Project ID (for office use) 	SP2SE22
Type of project	[ ✓] Traditional   	          [  ] Industrial		[  ] Continuing
Nature of project	[ ✓] Development            [  ] Research & Development 
Sustainable Development Goals(SDGs)	[ ✓] Decent Work and Economic Growth           [  ]  Climate Action
Area of specialization	[ ✓]  Web Development
Project Group Members
Sr.#	Reg. #	Student Name	Email ID	Signature
(i)	SP22-BSE-XXX	[Student Name 1]	SP22-BSE-XXX@cuilahore.edu.pk
(ii)	SP22-BSE-XXX	[Student Name 2]	SP22-BSE-XXX@cuilahore.edu.pk
(iii)	SP22-BSE-XXX	[Student Name 3]	SP22-BSE-XXX@cuilahore.edu.pk

Declaration: The candidates confirm that the work submitted is their own and appropriate credit has been given where reference has been made to the work of others.

ABSTRACT 
Small and medium-sized businesses (SMBs) in Pakistan face significant challenges in managing their financial operations, inventory tracking, customer relationships, and overall business administration. Most existing solutions are either too expensive for local businesses, lack localization features, or require extensive technical knowledge to operate. This gap highlights the need for an affordable, comprehensive, and user-friendly business management solution tailored for the Pakistani market.

Money Flow addresses this critical need by providing a comprehensive Business Management Platform designed specifically for small to medium businesses. The system enables users to manage finances, inventory, customers, and operations from a single, intuitive dashboard. It offers real-time analytics, invoice generation with PDF export, customer management with payment history tracking, inventory management with low-stock alerts, and comprehensive financial reporting including Profit & Loss statements, Balance Sheets, and Cash Flow reports.

The platform implements enterprise-grade security features including Row-Level Security (RLS), JWT authentication, role-based access control (RBAC), and complete audit logging. The multi-tenant architecture ensures complete data isolation between organizations while supporting multiple user roles from Super Admin to Cashier level access. The system is built using modern web technologies including React 18, TypeScript, Tailwind CSS, and Supabase for backend services, ensuring scalability, reliability, and excellent user experience.

Money Flow aims to democratize business management tools by making professional-grade features accessible to businesses of all sizes in Pakistan.

Acknowledgement 
We want to express our deep gratitude to [Supervisor Name] for their unwavering support and mentorship throughout our final year project. Their guidance, encouragement, and dedication have been incredibly valuable in shaping our project's path.

Table of Contents
Chapter 1.	Introduction
1.1	Introduction
1.2	Problem Statement
1.3	Proposed Solution
1.4	Main Objectives
1.5	Assumptions and Constraints
1.6	Project Scope
1.7	Software Life Cycle Model
Chapter 2.	Requirement Analysis
2.1	Literature Review/Existing System Study
2.2	Technologies and Frameworks
2.3	Gaps and Opportunities
2.4	Stakeholders List
2.5	Requirement Elicitation
2.6	Use Case Description
Chapter 3.	System Design
3.1	Use Case Diagrams
3.2	Activity Diagrams
3.3	Sequence Diagrams
3.4	Software Architecture Diagram
3.5	Class Diagram
3.6	Database Diagram
Chapter 4.	System Testing
4.1	Test Case Design
4.2	System Testing
Chapter 5.	Implementation
5.1	Work Breakdown Structure
5.2	Team Roles and Responsibilities
5.3	Tools and Technologies
5.4	Implementation Details
5.5	Screenshots of System
5.6	Challenges During Implementation
Chapter 6.	Conclusion
6.1	Project Summary
6.2	Recommendations for Future Work
Chapter 7.	References

Chapter 1.	Introduction

1.1	Introduction

In the rapidly evolving digital economy of Pakistan, small and medium-sized businesses (SMBs) form the backbone of the nation's economic growth. However, these businesses often struggle with managing their day-to-day operations efficiently due to the lack of affordable, comprehensive, and user-friendly business management tools. While international solutions like QuickBooks and Xero offer sophisticated features, their high subscription costs, lack of localization, and complexity make them inaccessible to most Pakistani businesses.

The motivation behind this project stems from observing the challenges faced by local shop owners, freelancers, and small business operators who still rely on manual bookkeeping, paper-based invoicing, and spreadsheet-based inventory tracking. Through discussions with business owners across various sectors—retail, services, and wholesale—it became evident that there is a strong demand for a system that combines invoicing, customer management, inventory tracking, and financial reporting in a single, affordable platform.

Money Flow represents a comprehensive Business Management Platform that enables small to medium businesses to manage finances, inventory, customers, and operations from a single dashboard. The platform provides real-time business analytics, professional invoice generation with PDF export, complete customer relationship management, inventory tracking with automated low-stock alerts, and comprehensive financial reporting including Profit & Loss statements, Balance Sheets, and Cash Flow reports.

1.2	Problem Statement

Small and medium-sized businesses in Pakistan face significant challenges in managing their financial operations, inventory, and customer relationships effectively. Most business owners rely on manual methods such as paper ledgers, basic spreadsheets, or disconnected software tools that do not communicate with each other.

Key Problems:
- Data Inconsistency and Loss: Manual record-keeping is prone to errors and physical damage
- Lack of Real-Time Insights: Business owners cannot access real-time information about their financial health
- Inefficient Invoicing: Creating professional invoices manually is time-consuming and error-prone
- Poor Customer Management: Tracking customer information and payment history is challenging
- Expensive Existing Solutions: International platforms charge monthly subscription fees in USD
- Limited Technical Expertise: Many small business owners lack technical knowledge

Money Flow aims to address these challenges by providing a comprehensive, affordable, and user-friendly business management platform specifically designed for the Pakistani market.

1.3	Proposed Solution

Money Flow proposes a comprehensive web-based business management platform that integrates all essential business operations into a single, unified system:

- Integrated Dashboard: Centralized dashboard displaying real-time business metrics
- Professional Invoice Management: Complete invoicing solution with PDF export
- Customer Relationship Management: Comprehensive customer profiles with transaction history
- Inventory Management: Real-time inventory tracking with low-stock alerts
- Financial Reporting: Comprehensive reports including P&L, Balance Sheet, Cash Flow
- Multi-User Support: Role-based access control for team members
- Localization: PKR currency, local payment methods (JazzCash, EasyPaisa, Raast)
- Cloud-Based Architecture: Built on Supabase for security and accessibility

1.4	Main Objectives

- Providing Real-Time Business Analytics
- Automating Invoice Generation with PDF export
- Managing Customer Relationships with payment tracking
- Tracking Inventory in Real-Time with alerts
- Generating Financial Reports (P&L, Balance Sheet, Cash Flow)
- Supporting Multiple User Roles with permissions
- Ensuring Data Security with RLS and JWT authentication
- Providing Localized Experience for Pakistani market
- Enabling Mobile Access with PWA support
- Maintaining Affordability for SMBs

1.5	Assumptions and Constraints

Assumptions:
- Users are familiar with basic computer operations
- Reliable internet access is available
- Users have basic understanding of business operations
- PKR is the primary currency

Constraints:
- Internet dependency for full functionality
- Browser compatibility requirements
- Data storage limits on free tier
- Third-party service dependencies

1.6	Project Scope

In Scope:
- User authentication and authorization
- Organization setup and configuration
- Dashboard with real-time metrics
- Customer management (CRUD)
- Product/inventory management
- Invoice creation and PDF generation
- Payment recording and tracking
- Transaction management
- Financial reports
- User role management
- Settings configuration
- Subscription management
- Responsive design and PWA support

Out of Scope:
- POS hardware integration
- Payroll processing
- E-commerce storefront
- Native mobile applications
- Multi-language support (initial release)

1.7	Software Life Cycle Model

Money Flow follows the Agile Model for development, consisting of:
- Requirement Analysis
- System Design
- Implementation (Coding)
- Testing
- Deployment
- Maintenance

Agile was chosen because it allows continuous adaptation, incremental delivery, regular collaboration, and iterative improvement based on user feedback.

Chapter 2.	Requirement Analysis

2.1	Literature Review/Existing System Study

Existing Systems Reviewed:
- QuickBooks: Comprehensive but expensive ($30/month), lacks Pakistani localization
- Xero: Good features but requires accounting knowledge, no local payment support
- Wave: Free but lacks inventory management and Pakistani payment methods
- Zoho Books: Complex interface, advanced features require paid plans
- FreshBooks: User-friendly but lacks inventory, priced at $17/month

2.2	Technologies and Frameworks

- Cloud Computing (Supabase)
- React 18 with TypeScript
- Tailwind CSS with shadcn/ui
- PostgreSQL database
- REST APIs
- PDF Generation (jsPDF)
- Real-Time Updates (WebSockets)
- JWT Authentication

2.3	Gaps and Opportunities

- Affordable Pricing for Pakistani market
- Pakistani Localization (PKR, local payments)
- Simplified User Experience
- Integrated Solution (all features in one platform)
- Offline Capability (PWA support)
- Role-Based Access Control

Comparison Table:

| Feature | QuickBooks | Xero | Wave | Money Flow |
|---------|------------|------|------|------------|
| Free Plan | ❌ | ❌ | ✅ | ✅ |
| PKR Support | ❌ | ✅ | ❌ | ✅ |
| Local Payments | ❌ | ❌ | ❌ | ✅ |
| Inventory | ✅ | ✅ | ❌ | ✅ |
| Simple Interface | ❌ | ❌ | ✅ | ✅ |
| PWA Support | ❌ | ❌ | ❌ | ✅ |

2.4	Stakeholders List

| Stakeholder | Type | Expectations |
|-------------|------|--------------|
| Front-End Developer | Internal | Responsive, user-friendly interface |
| Backend Developer | Internal | Efficient API and data management |
| UI/UX Designer | Internal | Intuitive design |
| QA Engineers | Internal | Bug-free functionality |
| Business Owners | External | Comprehensive management tools |
| Accountants | External | Accurate financial reports |
| Employees/Staff | External | Easy-to-use interface |

2.5	Requirement Elicitation

Functional Requirements:
- FR-001: User Registration
- FR-002: Login/Logout
- FR-003: Organization Setup
- FR-004: Password Reset
- FR-005: Dashboard Access
- FR-006: Customer Management
- FR-007: Product/Inventory Management
- FR-008: Invoice Creation
- FR-009: Payment Recording
- FR-010: Transaction Management
- FR-011: Financial Reports
- FR-012: Expense Tracking
- FR-013: User Role Management
- FR-014: Settings Configuration
- FR-015: Subscription Management

Non-Functional Requirements:
- NFR-001: Performance (page load < 3s)
- NFR-002: Security (RLS, JWT, encryption)
- NFR-003: Reliability (99.9% uptime)
- NFR-004: User Friendly (no training required)
- NFR-005: Maintainability (modular architecture)
- NFR-006: Recovery Time (< 5 minutes)
- NFR-007: Availability (24/7)

2.6	Use Case Description

Key Use Cases:
- UC-001: User Registration
- UC-002: Login/Logout
- UC-003: Organization Setup
- UC-004: Customer Management
- UC-005: Product Management
- UC-006: Invoice Creation
- UC-007: Payment Recording
- UC-008: Financial Reports
- UC-009: User Role Management

Chapter 3.	System Design

3.1	Use Case Diagrams
[Insert Use Case Diagrams for each module]

3.2	Activity Diagrams
[Insert Activity Diagrams for each workflow]

3.3	Sequence Diagrams
[Insert Sequence Diagrams for each interaction]

3.4	Software Architecture Diagram

Money Flow uses a layered full-stack architecture:
- User Interface Layer (React.js)
- API Layer (Supabase Edge Functions)
- Business Logic Layer (TypeScript services)
- Database Layer (PostgreSQL)
- Storage Layer (Supabase Storage)
- Authentication Layer (Supabase Auth)

3.5	Class Diagram
[Insert Class Diagram showing entities and relationships]

3.6	Database Diagram

Core Tables:
- organizations: Business/tenant data
- users: Team members
- customers: Business clients
- products: Products and services
- invoices: Sales invoices
- invoice_items: Invoice line items
- transactions: All money movements
- bank_accounts: Business bank accounts
- expense_categories: Expense categorization
- audit_logs: Activity tracking

Chapter 4.	System Testing

4.1	Test Case Design

Test Cases for each module:
- TC-001: User Registration
- TC-002: Login/Logout
- TC-003: Customer CRUD
- TC-004: Product CRUD
- TC-005: Invoice Creation
- TC-006: Payment Recording
- TC-007: Report Generation
- TC-008: Role Management

4.2	System Testing

Testing Types:
- Unit Testing: Individual component testing
- Integration Testing: Module interaction testing
- System Testing: End-to-end testing
- Acceptance Testing: User acceptance validation

Tools Used:
- Jest (Unit Testing)
- Postman (API Testing)
- Playwright (E2E Testing)

Chapter 5.	Implementation

5.1	Work Breakdown Structure

Phases:
1. Planning & Documentation
2. System Design
3. Frontend Development
4. Backend Development
5. Integration
6. Testing
7. Deployment
8. Maintenance

5.2	Team Roles and Responsibilities

| Team Member | Activity |
|-------------|----------|
| Developer 1 | Frontend Development, UI/UX |
| Developer 2 | Backend Development, Database |
| Developer 3 | Integration, Testing, Deployment |

5.3	Tools and Technologies

Frontend:
- React 18 with TypeScript
- Tailwind CSS + shadcn/ui
- React Query + Zustand
- React Hook Form + Zod
- Recharts (Charts)
- Lucide React (Icons)

Backend:
- Supabase (PostgreSQL + Auth + Storage)
- Edge Functions (Deno)
- Real-time WebSockets

DevOps:
- Git/GitHub (Version Control)
- Vercel (Deployment)
- Supabase Cloud (Database)

5.4	Implementation Details

The implementation follows a modular full-stack architecture:

1. Frontend Layer: React components for dashboard, customers, products, invoices, reports
2. State Management: Zustand for global state, React Query for server state
3. API Layer: RESTful services communicating with Supabase
4. Database Layer: PostgreSQL with Row-Level Security
5. Authentication: Supabase Auth with JWT tokens
6. Storage: Supabase Storage for avatars, logos, receipts

5.5	Screenshots of System

Authentication:
- Figure 5.1: Login Page
- Figure 5.2: Sign Up Page
- Figure 5.3: Password Reset

Dashboard:
- Figure 5.4: Dashboard Overview
- Figure 5.5: Revenue Analytics
- Figure 5.6: Recent Transactions

Customers:
- Figure 5.7: Customer List
- Figure 5.8: Add Customer Form
- Figure 5.9: Customer Details

Products:
- Figure 5.10: Product List
- Figure 5.11: Add Product Form
- Figure 5.12: Inventory Alerts

Invoices:
- Figure 5.13: Invoice List
- Figure 5.14: Create Invoice
- Figure 5.15: Invoice Preview
- Figure 5.16: PDF Export

Reports:
- Figure 5.17: Profit & Loss Report
- Figure 5.18: Balance Sheet
- Figure 5.19: Cash Flow Report
- Figure 5.20: Sales Report

Settings:
- Figure 5.21: Business Profile
- Figure 5.22: User Management
- Figure 5.23: Subscription Plans

5.6	Challenges During Implementation

- Project Scope: Defining unique requirements
- UI Design: Selecting the best design approach
- Security: Implementing Row-Level Security
- Performance: Optimizing for large datasets
- Integration: Connecting multiple services

Chapter 6.	Conclusion

6.1	Project Summary

Money Flow is a comprehensive business management platform designed to bridge the gap in affordable business tools for Pakistani SMBs. It provides real-time analytics, professional invoicing, customer management, inventory tracking, and financial reporting in a single, user-friendly platform. The system is built with modern technologies ensuring scalability, security, and excellent user experience.

Key Achievements:
- Complete business management solution
- Professional invoice generation with PDF export
- Comprehensive financial reports
- Role-based access control
- Multi-tenant architecture
- PWA support for mobile access
- Localization for Pakistani market

6.2	Recommendations for Future Work

- Mobile Native Applications (iOS/Android)
- AI-Powered Business Insights
- Multi-Language Support (Urdu)
- Bank Account Reconciliation
- Payroll Processing Module
- E-commerce Integration
- Advanced Analytics Dashboard
- WhatsApp Business Integration

Chapter 7.	References

[1] "QuickBooks," Intuit Inc. [Online]. Available: https://quickbooks.intuit.com/
[2] "Xero," Xero Limited. [Online]. Available: https://www.xero.com/
[3] "Wave," Wave Financial Inc. [Online]. Available: https://www.waveapps.com/
[4] "Zoho Books," Zoho Corporation. [Online]. Available: https://www.zoho.com/books/
[5] "FreshBooks," FreshBooks. [Online]. Available: https://www.freshbooks.com/
[6] "Supabase," Supabase Inc. [Online]. Available: https://supabase.com/
[7] "React," Meta Platforms. [Online]. Available: https://react.dev/
[8] "TypeScript," Microsoft. [Online]. Available: https://www.typescriptlang.org/
[9] "Tailwind CSS," Tailwind Labs. [Online]. Available: https://tailwindcss.com/
[10] "shadcn/ui," shadcn. [Online]. Available: https://ui.shadcn.com/
[11] "Vercel," Vercel Inc. [Online]. Available: https://vercel.com/
