import { describe, expect, test } from "bun:test";
import React from "react";
import { renderToString } from "react-dom/server";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Select } from "@/components/ui/select";
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tooltip } from "@/components/ui/tooltip";
import { Accordion, AccordionItem } from "@/components/ui/accordion";
import { Progress } from "@/components/ui/progress";
import { Sheet, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Popover, PopoverContent } from "@/components/ui/popover";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@/components/ui/collapsible";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Breadcrumbs, BreadcrumbItem, BreadcrumbLink, BreadcrumbSeparator, BreadcrumbPage } from "@/components/ui/breadcrumbs";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { Toast, ToastContainer } from "@/components/ui/toast";
import { Slider } from "@/components/ui/slider";
import { HoverCard, HoverCardTrigger, HoverCardContent } from "@/components/ui/hover-card";
import { Command, CommandInput, CommandList, CommandEmpty, CommandItem } from "@/components/ui/command";

describe("Component: shadcn/ui Primitives Comprehensive Suite", () => {
  test("Button renders variants, sizes, and merges custom classes cleanly", () => {
    const html = renderToString(
      React.createElement(Button, { variant: "outline", size: "sm", className: "custom-btn-test" }, "Click Me")
    );
    expect(html).toContain("Click Me");
    expect(html).toContain("custom-btn-test");
    expect(html).toContain("border border-white/10");
  });

  test("Badge renders default, secondary, and accent variants with ARIA attributes", () => {
    const html = renderToString(
      React.createElement(Badge, { variant: "accent" }, "VIP Tier")
    );
    expect(html).toContain("VIP Tier");
    expect(html).toContain("bg-[#22b8aa]/20");
  });

  test("Card family renders nested structural slots with card border styles", () => {
    const html = renderToString(
      React.createElement(
        Card,
        { className: "my-card" },
        React.createElement(
          CardHeader,
          null,
          React.createElement(CardTitle, null, "Card Title"),
          React.createElement(CardDescription, null, "Card Description")
        ),
        React.createElement(CardContent, null, "Card Content"),
        React.createElement(CardFooter, null, "Card Footer")
      )
    );
    expect(html).toContain("Card Title");
    expect(html).toContain("Card Description");
    expect(html).toContain("Card Content");
    expect(html).toContain("Card Footer");
    expect(html).toContain("my-card");
  });

  test("Input and Textarea render form attributes and focus styles", () => {
    const inputHtml = renderToString(
      React.createElement(Input, { placeholder: "Search model...", defaultValue: "Geely" })
    );
    const textareaHtml = renderToString(
      React.createElement(Textarea, { placeholder: "Notes...", defaultValue: "Specs confirmed" })
    );
    expect(inputHtml).toContain('placeholder="Search model..."');
    expect(inputHtml).toContain('value="Geely"');
    expect(textareaHtml).toContain("Specs confirmed");
  });

  test("Table primitives render valid table HTML structure and cells", () => {
    const html = renderToString(
      React.createElement(
        Table,
        null,
        React.createElement(
          TableHeader,
          null,
          React.createElement(TableRow, null, React.createElement(TableHead, null, "Model Name"))
        ),
        React.createElement(
          TableBody,
          null,
          React.createElement(TableRow, null, React.createElement(TableCell, null, "Geome E20"))
        )
      )
    );
    expect(html).toContain("<table");
    expect(html).toContain("Model Name");
    expect(html).toContain("Geome E20");
  });

  test("Dialog renders title, description, and overlay when open", () => {
    const html = renderToString(
      React.createElement(
        Dialog,
        { open: true, onClose: () => {} },
        React.createElement(
          DialogHeader,
          null,
          React.createElement(DialogTitle, null, "Edit Vehicle"),
          React.createElement(DialogDescription, null, "Update inventory details")
        ),
        React.createElement(DialogFooter, null, React.createElement(Button, null, "Save"))
      )
    );
    expect(html).toContain("Edit Vehicle");
    expect(html).toContain("Update inventory details");
    expect(html).toContain("Save");
    expect(html).toContain("role=\"dialog\"");
  });

  test("Switch and Checkbox render accessibility state attributes", () => {
    const switchHtml = renderToString(
      React.createElement(Switch, { checked: true, "aria-label": "Toggle listing" })
    );
    const checkboxHtml = renderToString(
      React.createElement(Checkbox, { checked: true, label: "Confirm Color" })
    );
    expect(switchHtml).toContain('role="switch"');
    expect(switchHtml).toContain('aria-checked="true"');
    expect(checkboxHtml).toContain("Confirm Color");
  });

  test("Accordion and Collapsible render expandable containers", () => {
    const accordionHtml = renderToString(
      React.createElement(
        Accordion,
        null,
        React.createElement(AccordionItem, { value: "specs", title: "Technical Specs", defaultOpen: true }, "39.4 kWh Battery")
      )
    );
    const collapsibleHtml = renderToString(
      React.createElement(
        Collapsible,
        { defaultOpen: true },
        React.createElement(CollapsibleTrigger, null, "Toggle Filter"),
        React.createElement(CollapsibleContent, null, "Filter Options")
      )
    );
    expect(accordionHtml).toContain("Technical Specs");
    expect(accordionHtml).toContain("39.4 kWh Battery");
    expect(collapsibleHtml).toContain("Toggle Filter");
    expect(collapsibleHtml).toContain("Filter Options");
  });

  test("Progress renders proper aria-valuenow and width percentage", () => {
    const html = renderToString(React.createElement(Progress, { value: 75, max: 100 }));
    expect(html).toContain('role="progressbar"');
    expect(html).toContain('aria-valuenow="75"');
    expect(html).toContain("width:75%");
  });

  test("Breadcrumbs and Pagination render accessible navigation links", () => {
    const breadcrumbHtml = renderToString(
      React.createElement(
        Breadcrumbs,
        null,
        React.createElement(BreadcrumbItem, null, React.createElement(BreadcrumbLink, { href: "/" }, "Home")),
        React.createElement(BreadcrumbSeparator, null),
        React.createElement(BreadcrumbItem, null, React.createElement(BreadcrumbPage, null, "Revenue King"))
      )
    );
    const paginationHtml = renderToString(
      React.createElement(
        Pagination,
        null,
        React.createElement(
          PaginationContent,
          null,
          React.createElement(PaginationItem, null, React.createElement(PaginationPrevious, null)),
          React.createElement(PaginationItem, null, React.createElement(PaginationLink, { isActive: true }, "1")),
          React.createElement(PaginationItem, null, React.createElement(PaginationNext, null))
        )
      )
    );
    expect(breadcrumbHtml).toContain("Home");
    expect(breadcrumbHtml).toContain("Revenue King");
    expect(paginationHtml).toContain("aria-label=\"pagination\"");
    expect(paginationHtml).toContain("aria-current=\"page\"");
  });

  test("Toast and Alert render status notifications with semantic styling", () => {
    const toastHtml = renderToString(
      React.createElement(Toast, { title: "Saved", description: "Vehicle saved to Feishu", variant: "success" })
    );
    const alertHtml = renderToString(
      React.createElement(
        Alert,
        { variant: "destructive" },
        React.createElement(AlertTitle, null, "Error"),
        React.createElement(AlertDescription, null, "Permission denied")
      )
    );
    expect(toastHtml).toContain("Saved");
    expect(toastHtml).toContain("Vehicle saved to Feishu");
    expect(alertHtml).toContain("Permission denied");
    expect(alertHtml).toContain("border-red-500/30");
  });

  test("Sheet renders slide-in panel with title and close action", () => {
    const sheetHtml = renderToString(
      React.createElement(
        Sheet,
        { open: true, onOpenChange: () => {}, side: "right" },
        React.createElement(SheetHeader, null, React.createElement(SheetTitle, null, "Menu Title")),
        React.createElement(SheetDescription, null, "Menu Description")
      )
    );
    expect(sheetHtml).toContain("Menu Title");
    expect(sheetHtml).toContain("Menu Description");
    expect(sheetHtml).toContain("slide-in-from-right");
  });

  test("RadioGroup and RadioGroupItem render radiogroup accessibility structure", () => {
    const html = renderToString(
      React.createElement(
        RadioGroup,
        { value: "fob", name: "pricing" },
        React.createElement(RadioGroupItem, { value: "fob", id: "r1" }, "FOB Export Price"),
        React.createElement(RadioGroupItem, { value: "cif", id: "r2" }, "CIF Delivered Price")
      )
    );
    expect(html).toContain('role="radiogroup"');
    expect(html).toContain("FOB Export Price");
    expect(html).toContain("CIF Delivered Price");
    expect(html).toContain('name="pricing"');
  });

  test("Slider renders range input control with step and value", () => {
    const html = renderToString(
      React.createElement(Slider, { value: 45, min: 0, max: 100, step: 5 })
    );
    expect(html).toContain('type="range"');
    expect(html).toContain('value="45"');
    expect(html).toContain('step="5"');
  });

  test("Popover and HoverCard render popover and hover preview panels", () => {
    const popoverHtml = renderToString(
      React.createElement(
        Popover,
        { open: true, onOpenChange: () => {} },
        React.createElement(PopoverContent, { open: true }, "Popover Content")
      )
    );
    const hoverHtml = renderToString(
      React.createElement(
        HoverCard,
        null,
        React.createElement(HoverCardTrigger, null, "Hover Me"),
        React.createElement(HoverCardContent, null, "Hover Content")
      )
    );
    expect(popoverHtml).toContain("Popover Content");
    expect(hoverHtml).toContain("Hover Me");
  });

  test("Command primitives render fast search input and list item results", () => {
    const html = renderToString(
      React.createElement(
        Command,
        null,
        React.createElement(CommandInput, { placeholder: "Search brand..." }),
        React.createElement(
          CommandList,
          null,
          React.createElement(CommandItem, null, "Geely Auto"),
          React.createElement(CommandEmpty, null, "No result")
        )
      )
    );
    expect(html).toContain('placeholder="Search brand..."');
    expect(html).toContain("Geely Auto");
  });

  test("ScrollArea and AspectRatio render standard container styles", () => {
    const scrollHtml = renderToString(
      React.createElement(ScrollArea, { className: "h-64" }, "Scrollable text")
    );
    const aspectHtml = renderToString(
      React.createElement(AspectRatio, { ratio: 16 / 9 }, React.createElement("img", { src: "/test.webp", alt: "Vehicle" }))
    );
    expect(scrollHtml).toContain("Scrollable text");
    expect(scrollHtml).toContain("scrollbar-thin");
    expect(aspectHtml).toContain("padding-bottom:56.25%");
  });
});

