# LEDES98BI Editor - Web Application

A modern, web-based editor for LEDES98BI legal invoice files built with Next.js, TypeScript, and TanStack Table.

## Features

- **Full LEDES98BI Support**: Edit all 52 standard LEDES fields
- **Real-time Validation**: Comprehensive field and cross-field validation
- **High Performance**: Handle large datasets with virtualized table rendering
- **File Import/Export**: Load and save LEDES format files
- **Modern UI**: Responsive design with Tailwind CSS
- **Type Safety**: Full TypeScript support

## Quick Start

### Prerequisites

- Node.js 18.0.0 or higher
- npm or yarn package manager

### Installation

1. **Install dependencies:**

   ```bash
   npm install
   ```

2. **Start development server:**

   ```bash
   npm run dev
   ```

3. **Open your browser:**
   Navigate to [http://localhost:3000](http://localhost:3000)

### Production Build

```bash
npm run build
npm start
```

## Usage

### Loading Data

1. **Upload File**: Drag and drop a LEDES file or click "Choose File"
2. **Create New**: Start with an empty dataset

### Editing Data

- Click any cell to edit its value
- Press Enter or click outside to save changes
- Use table controls for sorting, filtering, and pagination

### Validation

- Automatic validation runs after data changes
- View detailed validation results in the "Validation" tab
- Red highlights indicate validation errors

### Export Data

- Click "Download" to save your edited data as a LEDES format file

## LEDES Format Support

This editor supports the complete LEDES98BI specification with 52 fields:

**Invoice Information:**

- Invoice Date, Number, Total, Description
- Billing Start/End Dates
- Tax and Currency Information

**Line Item Details:**

- Date, Units, Cost, Adjustments
- Tax Rates and Totals
- Descriptions and Codes

**Law Firm Information:**

- Name, Address, Contact Details
- Registration ID

**Client Information:**

- Name, Address, Contact Details
- Registration ID

## Validation Rules

The editor enforces comprehensive validation:

### Field-Level Validation

- **Dates**: YYYYMMDD format validation
- **Currency**: Proper decimal formatting (max 2 decimal places)
- **Numbers**: Integer and decimal validation
- **Text**: Length limits and character restrictions
- **Codes**: State codes and currency symbols

### Cross-Field Validation

- **Date Ranges**: Billing end date must be after start date
- **Calculations**: Line item totals must equal units × cost + adjustments + tax
- **Invoice Consistency**: All line items for an invoice must have matching totals

### Dataset-Level Validation

- **Invoice Integrity**: Consistent totals across all line items for each invoice
- **Cross-References**: Validation of related fields across multiple rows

## Technology Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **UI Components**: React with Tailwind CSS
- **Table**: TanStack Table for performance
- **Icons**: Lucide React
- **Styling**: Tailwind CSS with custom components

## File Format

The editor works with pipe-delimited (|) text files:

```
INVOICE_DATE[]|INVOICE_NUMBER[]|CLIENT_MATTER_ID[]|...
20240101|INV-001|MATTER-123|...
20240102|INV-002|MATTER-124|...
```

## Development

### Project Structure

```
src/
├── app/                 # Next.js app router
│   ├── layout.tsx      # Root layout
│   ├── page.tsx        # Home page
│   └── globals.css     # Global styles
├── components/          # React components
│   ├── LedesTable.tsx  # Main data table
│   ├── FileUpload.tsx  # File upload component
│   ├── ValidationPanel.tsx # Validation display
│   └── InfoPanel.tsx   # Dataset information
├── lib/                # Core logic
│   ├── types.ts        # TypeScript definitions
│   ├── ledesValidator.ts # Validation logic
│   ├── ledesFileHandler.ts # File I/O
│   └── utils.ts        # Utility functions
└── hooks/              # React hooks
    └── useLedesData.ts # Data management hook
```

### Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript compiler

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## Support

For issues and questions:

1. Check the GitHub Issues page
2. Create a new issue with detailed information
3. Include sample files if relevant
