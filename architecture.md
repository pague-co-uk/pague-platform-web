                         ┌─────────────────────────┐
                         │       Next.js Portal    │
                         │                         │
                         │  SERVER                 │
                         │  ─────────────────────  │
                         │  Authentication         │
                         │  Authorization          │
                         │  Data fetching          │
                         │  Permission evaluation  │
                         │  Query construction     │
                         │  Pagination             │
                         │  Sorting                │
                         │  Filtering              │
                         │  Route protection       │
                         │                         │
                         │           │             │
                         │           ▼             │
                         │     View Model          │
                         │                         │
                         │  CLIENT                 │
                         │  ─────────────────────  │
                         │  Rendering              │
                         │  Interaction            │
                         │  Form state             │
                         │  Dialogs                │
                         │  Tables                 │
                         │  Charts                 │
                         │  Tabs                   │
                         │  Live UI updates        │
                         └────────────┬────────────┘
                                      │
                                      │ HTTPS
                                      ▼
                         ┌─────────────────────────┐
                         │    Control Plane API    │
                         │                         │
                         │ Authentication          │
                         │ Authorization           │
                         │ Tenant isolation        │
                         │ Business rules          │
                         │ Audit                   │
                         │ Reporting               │
                         └────────────┬────────────┘
                                      │
                                      ▼
                              ┌──────────────┐
                              │    MySQL     │
                              └──────────────┘