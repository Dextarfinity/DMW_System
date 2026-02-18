
"use client";

import Link from "next/link";
import { useState } from "react";
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetHeader } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu, Car, ChevronDown, LogOut } from "lucide-react";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuPortal
} from "@/components/ui/dropdown-menu"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"


export function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const isSuperAdmin = true;


  const handleLinkClick = () => {
    setIsMobileMenuOpen(false);
  };
  
  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/trip-ticket", label: "Trip Ticket" },
  ];

  const maintenanceLinks = [
      { href: "/maintenance/items", label: "Items" },
      { href: "/maintenance/running-inventory", label: "Running Inventory"},
      { href: "/maintenance/uom", label: "Unit of Measurement (UOM)" },
      { href: "/maintenance/uacs", label: "UACS" },
      { href: "/maintenance/procurement", label: "Mode of Procurement" },
      { href: "/maintenance/fund-cluster", label: "Fund Cluster" },
      { href: "/maintenance/office", label: "Office" },
      { href: "/maintenance/divisions", label: "Sections" },
  ];

  const adminMaintenanceLinks = [
      { href: "/admin/suppliers", label: "Suppliers" },
      { href: "/admin/employees", label: "Employees" },
      { href: "/admin/designations", label: "Designations" },
      { href: "/admin/settings", label: "Settings" },
  ];

  const transactionLinks = [
      { href: "/transactions/po", label: "Purchase Orders (PO)" },
      { href: "/transactions/iar", label: "Inspection and Acceptance Report (IAR)" },
      { href: "#", label: "Received Items" },
      { href: "/transactions/ris", label: "Requisition and Issue Slip (RIS)" },
      { href: "/transactions/ics", label: "Inventory Custodian Slip (ICS)" },
      { href: "/transactions/par", label: "Property Acknowledgement Receipt (PAR)" },
  ];
  
  const receivedItemsLinks = [
      { href: "/transactions/received-semi-expendable", label: "Received Semi-Expendable" },
      { href: "/transactions/received-capital-outlay", label: "Received Capital Outlay" },
  ]

  const reportLinks = [
      { href: "/reports/stock-card", label: "Stock Card" },
      { href: "/reports/stock-ledger-card", label: "Stock Ledger Card" },
      { href: "/reports/property-card", label: "Property Card" },
      { href: "/reports/property-ledger-card", label: "Property Ledger Card" },
      { href: "/reports/rsmi", label: "Report of Supplies and Materials Issued (RSMI)" },
      { href: "/reports/rpci", label: "Report on Physical Count of Inventories (RPCI)" },
      { href: "/reports/rpcppe", label: "Report of Physical Count of Property, Plant, and Equipment (RPCPPE)" },
      { href: "/reports/iirup", label: "Inventory and Inspection Report of Unserviceable Property (IIRUP)" },
      { href: "/reports/lost-stolen-damaged", label: "Report of Lost, Stolen, and Damaged or Destroyed" },
      { href: "/reports/ptr", label: "Property Transfer Report (PTR)" },
  ];


  return (
    <header className="bg-primary text-primary-foreground shadow-md">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
        <Link href="/" className="flex items-center gap-2 font-semibold" prefetch={false}>
          <Car className="h-6 w-6" />
        </Link>
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="transition-colors hover:text-primary-foreground/80"
              prefetch={false}
            >
              {link.label}
            </Link>
          ))}
          {isSuperAdmin && (
            <>
                <DropdownMenu>
                    <DropdownMenuTrigger className="flex items-center gap-1 transition-colors hover:text-primary-foreground/80 outline-none">
                        Maintenance <ChevronDown className="h-4 w-4" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="bg-primary text-primary-foreground border-primary-foreground/20">
                        {maintenanceLinks.map(link => (
                            <DropdownMenuItem key={link.label} asChild className="hover:bg-primary-foreground/10 focus:bg-primary-foreground/10">
                                <Link href={link.href}>{link.label}</Link>
                            </DropdownMenuItem>
                        ))}
                    </DropdownMenuContent>
                </DropdownMenu>
                <DropdownMenu>
                    <DropdownMenuTrigger className="flex items-center gap-1 transition-colors hover:text-primary-foreground/80 outline-none">
                        Admin Maintenance <ChevronDown className="h-4 w-4" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="bg-primary text-primary-foreground border-primary-foreground/20">
                        {adminMaintenanceLinks.map(link => (
                            <DropdownMenuItem key={link.label} asChild className="hover:bg-primary-foreground/10 focus:bg-primary-foreground/10">
                                <Link href={link.href}>{link.label}</Link>
                            </DropdownMenuItem>
                        ))}
                    </DropdownMenuContent>
                </DropdownMenu>
                <DropdownMenu>
                    <DropdownMenuTrigger className="flex items-center gap-1 transition-colors hover:text-primary-foreground/80 outline-none">
                        Transactions <ChevronDown className="h-4 w-4" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="bg-primary text-primary-foreground border-primary-foreground/20">
                        {transactionLinks.map(link => (
                            link.label === "Received Items" ? (
                                <DropdownMenuSub key={link.label}>
                                    <DropdownMenuSubTrigger className="hover:bg-primary-foreground/10 focus:bg-primary-foreground/10 data-[state=open]:bg-primary-foreground/10">
                                        <span>{link.label}</span>
                                    </DropdownMenuSubTrigger>
                                    <DropdownMenuPortal>
                                    <DropdownMenuSubContent className="bg-primary text-primary-foreground border-primary-foreground/20">
                                        {receivedItemsLinks.map(subLink => (
                                            <DropdownMenuItem key={subLink.label} asChild className="hover:bg-primary-foreground/10 focus:bg-primary-foreground/10">
                                                <Link href={subLink.href}>{subLink.label}</Link>
                                            </DropdownMenuItem>
                                        ))}
                                    </DropdownMenuSubContent>
                                    </DropdownMenuPortal>
                                </DropdownMenuSub>
                            ) : (
                            <DropdownMenuItem key={link.label} asChild className="hover:bg-primary-foreground/10 focus:bg-primary-foreground/10">
                                <Link href={link.href}>{link.label}</Link>
                            </DropdownMenuItem>
                            )
                        ))}
                    </DropdownMenuContent>
                </DropdownMenu>
                <DropdownMenu>
                    <DropdownMenuTrigger className="flex items-center gap-1 transition-colors hover:text-primary-foreground/80 outline-none">
                        Reports <ChevronDown className="h-4 w-4" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="bg-primary text-primary-foreground border-primary-foreground/20">
                        {reportLinks.map(link => (
                            <DropdownMenuItem key={link.label} asChild className="hover:bg-primary-foreground/10 focus:bg-primary-foreground/10">
                                <Link href={link.href}>{link.label}</Link>
                            </DropdownMenuItem>
                        ))}
                    </DropdownMenuContent>
                </DropdownMenu>
            </>
          )}
        </nav>
        <div className="flex items-center gap-2">
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden hover:bg-primary-foreground/10">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Toggle navigation menu</span>
                </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[300px] bg-primary text-primary-foreground p-0">
                <SheetHeader className="p-6">
                <SheetTitle>
                    <VisuallyHidden>Navigation Menu</VisuallyHidden>
                </SheetTitle>
                </SheetHeader>
                <div className="flex h-full flex-col p-6 pt-0">
                    <Link href="/" className="mb-8 flex items-center gap-2 font-semibold" prefetch={false} onClick={handleLinkClick}>
                        <Car className="h-6 w-6" />
                        <span className="text-lg font-bold">DMW - Caraga</span>
                    </Link>
                    <nav className="flex flex-col gap-4 text-lg font-medium">
                    {navLinks.map((link) => (
                        <Link
                        key={link.label}
                        href={link.href}
                        className="transition-colors hover:text-primary-foreground/80"
                        prefetch={false}
                        onClick={handleLinkClick}
                        >
                        {link.label}
                        </Link>
                    ))}
                    {isSuperAdmin && (
                        <Accordion type="single" collapsible className="w-full">
                            <AccordionItem value="item-1" className="border-b-0">
                                <AccordionTrigger className="p-0 hover:no-underline hover:text-primary-foreground/80 transition-colors">Maintenance</AccordionTrigger>
                                <AccordionContent className="pt-2">
                                    <nav className="flex flex-col gap-2 pl-4 text-base">
                                        {maintenanceLinks.map((link) => (
                                            <Link
                                                key={link.label}
                                                href={link.href}
                                                className="transition-colors hover:text-primary-foreground/80"
                                                prefetch={false}
                                                onClick={handleLinkClick}
                                                >
                                                {link.label}
                                            </Link>
                                        ))}
                                    </nav>
                                </AccordionContent>
                            </AccordionItem>
                            <AccordionItem value="item-2" className="border-b-0">
                                <AccordionTrigger className="p-0 hover:no-underline hover:text-primary-foreground/80 transition-colors">Admin Maintenance</AccordionTrigger>
                                <AccordionContent className="pt-2">
                                    <nav className="flex flex-col gap-2 pl-4 text-base">
                                        {adminMaintenanceLinks.map((link) => (
                                            <Link
                                                key={link.label}
                                                href={link.href}
                                                className="transition-colors hover:text-primary-foreground/80"
                                                prefetch={false}
                                                onClick={handleLinkClick}
                                                >
                                                {link.label}
                                            </Link>
                                        ))}
                                    </nav>
                                </AccordionContent>
                            </AccordionItem>
                            <AccordionItem value="item-3" className="border-b-0">
                                <AccordionTrigger className="p-0 hover:no-underline hover:text-primary-foreground/80 transition-colors">Transactions</AccordionTrigger>
                                <AccordionContent className="pt-2">
                                    <nav className="flex flex-col gap-2 pl-4 text-base">
                                        {transactionLinks.map((link) => (
                                            link.label === "Received Items" ? (
                                                <Accordion key={link.label} type="single" collapsible className="w-full">
                                                    <AccordionItem value="received-items" className="border-b-0">
                                                        <AccordionTrigger className="p-0 text-base hover:no-underline hover:text-primary-foreground/80 transition-colors">
                                                            {link.label}
                                                        </AccordionTrigger>
                                                        <AccordionContent className="pt-2">
                                                            <nav className="flex flex-col gap-2 pl-4 text-base">
                                                                {receivedItemsLinks.map((subLink) => (
                                                                    <Link
                                                                        key={subLink.label}
                                                                        href={subLink.href}
                                                                        className="transition-colors hover:text-primary-foreground/80"
                                                                        prefetch={false}
                                                                        onClick={handleLinkClick}
                                                                    >
                                                                        {subLink.label}
                                                                    </Link>
                                                                ))}
                                                            </nav>
                                                        </AccordionContent>
                                                    </AccordionItem>
                                                </Accordion>
                                            ) : (
                                                <Link
                                                    key={link.label}
                                                    href={link.href}
                                                    className="transition-colors hover:text-primary-foreground/80"
                                                    prefetch={false}
                                                    onClick={handleLinkClick}
                                                >
                                                    {link.label}
                                                </Link>
                                            )
                                        ))}
                                    </nav>
                                </AccordionContent>
                            </AccordionItem>
                            <AccordionItem value="item-4" className="border-b-0">
                                <AccordionTrigger className="p-0 hover:no-underline hover:text-primary-foreground/80 transition-colors">Reports</AccordionTrigger>
                                <AccordionContent className="pt-2">
                                    <nav className="flex flex-col gap-2 pl-4 text-base">
                                        {reportLinks.map((link) => (
                                            <Link
                                                key={link.label}
                                                href={link.href}
                                                className="transition-colors hover:text-primary-foreground/80"
                                                prefetch={false}
                                                onClick={handleLinkClick}
                                                >
                                                {link.label}
                                            </Link>
                                        ))}
                                    </nav>
                                </AccordionContent>
                            </AccordionItem>
                        </Accordion>
                    )}
                    </nav>
                </div>
            </SheetContent>
            </Sheet>
        </div>
      </div>
    </header>
  );
}

    