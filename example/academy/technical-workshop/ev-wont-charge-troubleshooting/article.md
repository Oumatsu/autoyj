# EV Won't Charge: A Step-by-Step Troubleshooting Guide for African Technicians

**Category:** Technical Workshop
**Date:** May 16, 2026
**Read Time:** 9 min
**Tag:** EV charging fault · EV won't charge · Chinese EV charging problem · OBC fault diagnosis

---

![A technician inspecting the charging port of an electric vehicle in an automotive workshop in East Africa, diagnostic equipment visible, workshop lighting, professional commercial photography, sharp focus, no text](hero.jpg)
*Charging failures are the second most common EV complaint after range anxiety. Most are caused by one of six root causes — and most can be diagnosed and resolved without touching the HV system.*

---

## Overview

An EV that won't charge presents a complex diagnostic tree for technicians unfamiliar with EV charging architecture. The fault could be in the charging cable, the charge port, the on-board charger (OBC), the battery management system (BMS), the DC-DC converter, the vehicle communication system, or the charging infrastructure itself. In African markets, grid quality issues add an additional layer of complexity. This step-by-step troubleshooting guide gives technicians a structured approach to isolating the root cause quickly, distinguishing between vehicle faults and infrastructure faults, and resolving the most common charging problems without unnecessary parts replacement.

---

## Understanding the Charging Circuit Before You Diagnose

A charging fault can occur at any point in the circuit. Understanding the path that electricity takes from the grid to the battery helps you isolate where the fault lies.

**AC charging path (slow/home charging):**
Grid → EVSE (charging box or cable) → Charge port → On-Board Charger (OBC) → DC-DC conversion → HV battery pack (via BMS-controlled contactors)

**DC fast charging path:**
DC charger → Charge port (CCS2 or CHAdeMO connector) → BMS (direct — bypasses OBC) → HV battery pack

**Key insight:** AC charging goes through the OBC; DC fast charging bypasses it. If the vehicle charges on AC but not DC (or vice versa), you have immediately isolated the fault to one half of the charging system.

---

## Diagnostic Flowchart: Start Here

**Question 1: Does the vehicle charge on a different cable/EVSE?**
- Yes → Cable or EVSE is the fault, not the vehicle. Test the cable with another vehicle.
- No → Continue to Question 2.

**Question 2: Does the vehicle charge at a different location?**
- Yes → Supply issue at original location (voltage out of range, broken socket, RCD fault). Not a vehicle fault.
- No → Continue to Question 3.

**Question 3: Does the vehicle charge on AC but not DC (or DC but not AC)?**
- AC only fails → OBC or AC charge port fault. See OBC section below.
- DC only fails → DC charge port, CCS/CHAdeMO controller, or BMS communication fault. See DC section below.
- Both fail → Check 12V auxiliary battery first (see Step 1 below). Then check charge port and BMS.

---

## Step 1: Test the 12V Auxiliary Battery First

This step is counterintuitive but essential. The charge port lock, the OBC control relay, the BMS, and the charging communication system all require 12V power to operate. A weak or dead 12V battery will cause the vehicle to appear unresponsive to charging even though the HV system is fine.

Connect a multimeter to the 12V battery. With the vehicle off, voltage should be 12.4V or above. If below 12.0V, charge the 12V battery or replace it (see the [12V Auxiliary Battery guide]) before proceeding with any other charging diagnosis.

**This step alone resolves approximately 20% of "won't charge" faults.**

---

## Step 2: Inspect the Charge Port

The charge port on Chinese EVs sold in Africa typically follows the CCS2 (Combined Charging System Type 2) standard for AC charging and either CCS2 or CHAdeMO for DC. Inspect the port before connecting any diagnostic tools.

**What to look for:**

| Defect | Visual sign | Cause |
|---|---|---|
| Scored or burnt contacts | Discolouration, pitting on copper contacts | Dust contamination, repeated arcing, high resistance |
| Debris in port | Visible dust, dirt, insect ingress | Failure to cap port when not in use |
| Bent pins | Visible pin deformation | Connector forced in at wrong angle |
| Port lock stuck open or closed | Port latch not moving freely | Lock actuator fault (12V powered) |

If contacts are scored or burnt: the port requires cleaning or replacement. Do not continue charging through a damaged port — high contact resistance causes heating that worsens the damage and creates a fire risk.

**Cleaning scored contacts:** Use a dedicated electrical contact cleaner spray and a non-abrasive applicator (cotton bud or soft foam). Do not use sandpaper — it removes the contact plating and accelerates future corrosion.

---

## Step 3: Check for Fault Codes with Diagnostic Tool

Connect your LAUNCH X431 or AUTEL MaxiSYS tool and navigate to the OBC, BMS, and VCU modules (see [Chinese EV Diagnostic Tools guide] for connection procedure).

**Key fault codes and their meaning:**

| Code type | Module | Common meaning |
|---|---|---|
| OBC supply voltage fault | OBC | Grid voltage out of range (too high, too low, or unstable) |
| OBC internal fault | OBC | OBC hardware fault — requires OBC inspection |
| BMS charging contactor fault | BMS | Contactor stuck open or closed; wiring fault to contactor |
| BMS communication timeout during charge | BMS / VCU | CAN bus communication loss between BMS and charger |
| Charge port temperature high | Charge port sensor | Overheating at contacts (port damage or high resistance) |
| Insulation resistance low during charge | BMS | Water ingress, cable damage, or genuine insulation failure |

Record all fault codes before clearing any. The fault history is your evidence trail.

---

## Step 4: Grid Quality Issues (African-Specific)

Many Chinese EV on-board chargers are calibrated for stable grid supply — 220V ± 10%, 50Hz with minimal harmonic distortion. African grid supply frequently falls outside these parameters, particularly:

- **Voltage sag:** Grid voltage drops below 198V (10% below 220V nominal) during peak demand periods. The OBC protection circuit cuts out.
- **Voltage spike:** Generator-supplied power (common in Ethiopian commercial properties) can spike to 240–250V momentarily. Some OBCs will log a fault and refuse to charge.
- **Frequency instability:** Generator sets in Africa often run at 48–52Hz rather than a stable 50Hz. This affects OBC power factor correction circuits.

**How to diagnose a grid quality issue:**
- Connect a true-RMS AC voltmeter or power quality analyser between the charging socket and neutral/earth
- Monitor voltage over a 10-minute period during the time charging fails
- If voltage is outside 198–242V (±10% of 220V) at any point, the OBC is likely cutting out legitimately

**Practical fix:** An automatic voltage regulator (AVR) between the wall socket and the EVSE stabilises supply voltage and resolves most grid-quality charging faults. This is a common and inexpensive solution in Ethiopian commercial charging contexts (AVR units cost ETB 3,000–8,000 for suitable capacity).

---

## Step 5: OBC Fault Diagnosis

If fault codes point to OBC internal fault, or if the vehicle charges on DC but not AC (confirming the OBC is the issue):

**What the OBC does:** The on-board charger converts AC grid power to the DC voltage required by the HV battery pack. It is typically located in the front of the vehicle near the charge port or in the engine bay.

**OBC testing approach:**
- Confirm 12V control power is reaching the OBC module (check fuse, relay, and wiring from 12V battery)
- Confirm AC input is reaching the OBC (check incoming voltage at OBC AC input connector — requires HV safety precautions)
- If control power and AC input are confirmed present and OBC still does not activate, the OBC requires replacement

**Important:** OBC replacement on Chinese EVs is a HV-adjacent procedure. The OBC connects to both the AC supply and the HV DC bus on the battery side. Full HV isolation procedure is mandatory before disconnecting the OBC. See [High Voltage Safety Rules].

OBC units for common Chinese EV models are available from grey-market component suppliers. Lead time from China is typically 2–4 weeks. OEM sourcing through official dealer channels (where accessible) is preferred for warrantied components.

---

## Step 6: DC Fast Charging Specific Faults

If AC charging works but DC fast charging fails, the fault is in the DC charging path:

**Check 1: Connector compatibility**
Confirm the DC charger connector type matches the vehicle's DC port. In Africa, CCS2 is the most common standard on recent Chinese EVs, but older or budget-spec models may have CHAdeMO or proprietary connectors. Connector mismatch is a common cause of failed DC charging in markets where charger infrastructure is new.

**Check 2: Communication handshake**
DC fast charging uses a communication protocol (ISO 15118 or DIN 70121 for CCS2, CHAdeMO protocol for CHAdeMO) for the charger and vehicle to negotiate charge parameters. If this handshake fails, the charger aborts without delivering energy.

Diagnostic tool fault codes will typically indicate "DC charge communication fault" or "charge initiation timeout" if this is the cause. The fault can be in the vehicle's CCS communication controller or in the charger — test the charger with another vehicle to isolate.

**Check 3: Battery temperature limits**
The BMS will not allow DC fast charging if battery temperature is outside the permitted range. In Ethiopian conditions:
- Cold morning (below 10°C): BMS may restrict or prevent fast charging to protect cells
- Overtemperature (above 45°C battery temp): BMS will block fast charging

If temperature is the cause, the BMS will typically log a temperature-related charging inhibit code. Solution: allow the battery to warm (from driving) or cool (from parking in shade) before attempting fast charge.

---

## Summary: Common Causes by Frequency

In East African workshop experience, charging faults resolve to these causes in approximate order of frequency:

| Rank | Root cause | Resolution |
|---|---|---|
| 1 | Weak or dead 12V auxiliary battery | Charge or replace 12V battery |
| 2 | Grid voltage out of range | Install AVR, or charge at different location |
| 3 | Damaged charge port contacts | Clean or replace charge port |
| 4 | Faulty charging cable or EVSE | Replace cable or EVSE |
| 5 | OBC internal fault | Replace OBC |
| 6 | BMS charging contactor fault | Inspect contactor circuit |
| 7 | DC charge communication fault | Isolate between vehicle and charger |

Always work through the list from the top. Number 1 takes 5 minutes to test. Number 6 is a half-day job. Do not skip to complex repairs before ruling out simple causes.

---

## Sources

- IEC 61851 — Electric Vehicle Conductive Charging System (AC and DC charging standards)
- ISO 15118 — Vehicle to Grid Communication Interface (DC charging communication protocol)
- BYD Service Documentation — On-Board Charger Fault Diagnosis Guide (2025)
- Africa E-Mobility Alliance — EV Charging Infrastructure Challenges, East Africa (2025)
- Ethiopian Electric Power — Distribution Network Voltage Quality Standards (2024)

*本文充电故障排查流程基于通用EV充电架构原理，结合非洲东部电网实际情况整理。具体车型的故障码含义和维修规程请参阅各品牌官方技术手册。*

---

*Published by Youguard Academy · May 2026*
