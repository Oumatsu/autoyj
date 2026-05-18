# High Voltage Safety Rules for EV Technicians: What You Must Know Before Opening the Bonnet

**Category:** Technical Workshop
**Date:** May 16, 2026
**Read Time:** 10 min
**Tag:** EV high voltage safety · EV technician training · electric vehicle safety · HV battery safety

---

![An EV technician in full orange high voltage PPE including insulated gloves and face shield working on an electric vehicle in a workshop in East Africa, professional automotive workshop setting, professional commercial photography, sharp focus, no text](hero.jpg)
*High voltage safety is not optional in EV service. The risks are different from ICE vehicles — and the consequences of mistakes are immediate and severe.*

---

## Overview

High voltage safety rules for EV technicians are the non-negotiable foundation of any electric vehicle workshop operation. Unlike ICE vehicles where most risks are mechanical or involve hot fluids, EVs carry 200–800V DC electrical systems that can cause cardiac arrest from a single contact. This guide covers the fundamental safety protocol every technician working on Chinese EVs in Africa must understand before performing any service work. These rules apply regardless of the brand — BYD, Chery, MG, SAIC, or any other Chinese OEM operating in the region.

---

> **CRITICAL SAFETY NOTICE**
>
> High voltage (HV) systems in EVs operate at 200–800 volts DC. Direct contact can cause cardiac arrest, severe burns, or death. DC current at these levels is more dangerous than equivalent AC current because it causes sustained muscle contraction — the victim cannot let go. Never work on HV components without completing the isolation procedure described in this guide. Never assume an EV is safe because it is switched off.

---

## Understanding the EV High Voltage System

Before you can work safely, you must understand what you are dealing with.

**Voltage levels in Chinese EVs:**
- Most 400V platform vehicles (BYD Atto 3, MG4, Chery Omoda E5): 350–450V nominal battery pack
- 800V platform vehicles (BYD Han EV, upper-spec models): 700–800V nominal
- Orange cables = HV. Always. In any Chinese EV sold in Africa, orange-sheathed cables carry high voltage.

**Current flow characteristics:**
- HV systems carry DC current, not AC. The human body's threshold for sensing DC current is slightly higher than AC, but DC current at HV levels causes sustained muscular contraction. A technician who contacts a live HV line may be unable to release their grip, leading to prolonged exposure and cardiac arrest.
- Even with the ignition off, HV battery packs retain stored energy. Capacitors in the inverter retain charge for 5–15 minutes after isolation. Treat every HV component as live until the isolation procedure is complete and verified.

**What contains HV in a typical Chinese EV:**
- Battery pack (under the floor, always)
- Main inverter / motor controller
- On-board charger (OBC)
- DC-DC converter
- HVAC compressor motor
- Pre-charge resistors
- All orange-sheathed cables connecting the above

**What does NOT contain HV (safe to handle without isolation):**
- 12V auxiliary battery
- CAN bus / data cables (typically grey, white, or green)
- Lighting systems
- Regular 12V accessories

---

## The Mandatory Isolation Procedure

Every time you perform work that requires access to the HV system or battery area, you must follow this procedure in sequence. Do not skip steps.

**Step 1: Switch off the ignition and remove the key (or key fob)**

Place the key or fob at minimum 5 metres away from the vehicle, ideally in a locked drawer. This prevents accidental re-entry to Ready mode during service.

**Step 2: Disconnect the 12V auxiliary battery**

Disconnect the negative terminal of the 12V auxiliary battery first. This removes power from the vehicle's low-voltage control systems and prevents any automatic system activation.

**Step 3: Wait for the discharge period**

Wait a minimum of 5 minutes after disconnecting the 12V battery. This allows inverter capacitors to discharge. For 800V platform vehicles, wait 15 minutes. Do not trust indicator lights — they may remain lit from residual capacitor charge.

**Step 4: Remove the HV service disconnect / maintenance plug**

All Chinese EVs have a manual service disconnect — a plug or connector that physically breaks the HV circuit in the battery pack. Its location varies significantly between brands and model years — there is no universal position.

**Before working on any model for the first time, locate the service disconnect position in that model's official HV service documentation.** Common areas to check: rear underbody, boot floor, or side panel of the battery pack — but confirm before you search. Never probe around the battery area looking for it without confirmed knowledge of its location.

Pull the service disconnect using insulated tools only. Place it in your pocket or workshop lockbox — this is your physical lock-out mechanism.

**Step 5: Verify isolation with an insulation resistance tester**

Use a calibrated insulation resistance tester (megohmmeter, rated for 1,000V DC minimum) to verify that the HV system is isolated. Test between the HV positive cable and chassis ground, and between HV negative and chassis ground. A correctly isolated system should show greater than 1 MΩ on both tests.

Do not use a standard automotive multimeter for this test — it cannot verify HV insulation integrity.

**Step 6: Lock out and tag out**

Place a physical lockout tag on the service disconnect location and on the vehicle's windscreen. "HV SYSTEM ISOLATED — DO NOT ENERGISE" in both English and Amharic is recommended for Ethiopian workshops. The tag should include the technician's name and the date/time of isolation.

---

## Personal Protective Equipment (PPE) Requirements

The following PPE is mandatory for any work near exposed HV components. "Near" means within arm's reach of any orange cable, connector, or component with an HV warning label.

| PPE item | Specification required | Notes |
|---|---|---|
| Insulated gloves | Class 00 minimum (rated 500V) or Class 0 (rated 1,000V) | Must be tested and undamaged — check before every use |
| Face shield | Clear polycarbonate, anti-flash rated | Do not substitute safety glasses |
| Insulated boots | 1,000V rated (EH-rated in US/EU labelling) | Rubber sole is not sufficient |
| Non-conductive clothing | No metal zippers, belt buckles near HV work area | Cotton or appropriate synthetic — no bare skin near live components |

**Sourcing PPE in Ethiopia:** Class 0 (1,000V rated) insulating gloves are available from industrial electrical supply distributors in Addis Ababa. Youguard can advise dealers on supplier contacts upon request. Do not attempt HV service without appropriate PPE — there is no safe workaround.

---

## The "Orange Cable Rule" and Visual Identification

Training yourself and your team to automatically recognise HV indicators is the fastest path to safe habits.

**Orange = HV. Always.**
In all Chinese EVs designed for global markets (including all models sold in Africa), the international standard for HV cable sheathing is orange. If you see an orange cable, assume it is live until the isolation procedure is complete and verified.

**HV warning labels:**
Chinese EVs manufactured for export carry HV warning labels in multiple languages. They appear on the battery pack, inverter housing, orange cable runs, and service disconnect. These labels are orange or yellow with a lightning bolt symbol.

**Do not assume colour-coding on connector plugs:**
Some connectors in the HV circuit use non-orange connector housings despite carrying HV. This is model-specific. When in doubt, consult the HV circuit diagram for the specific model before touching any connector in the battery or drivetrain area.

---

## Workshop Setup Requirements for HV Safety

A workshop handling EVs needs the following baseline infrastructure before taking in HV service work:

**Essential:**
- Insulated floor matting (rubber, minimum 1,000V rated) in the service bay
- Dedicated lockbox or cabinet for service disconnects (locked, technician holds key)
- First aid kit that includes AED (automated external defibrillator) — cardiac arrest is the primary lethal risk from HV contact
- Posted HV emergency procedure (what to do if a technician contacts HV)
- Insulation resistance tester, calibrated within 12 months

**Strongly recommended:**
- HV warning barrier/cone set to isolate the service bay during HV work
- Printed HV circuit diagram for each model in your service fleet (available from OEM technical support portals)
- Fire extinguisher rated for electrical fires (CO₂ or dry chemical — never water or foam on an electrical fire)

---

## Emergency Response: If a Technician Contacts HV

This section is not for the technician who contacts HV — it is for the people around them.

**Do not touch the person until you are certain the HV circuit is broken.**
A person in contact with a live HV circuit will cause current to flow through anyone who touches them. This is how HV accidents become multiple-casualty incidents.

**Correct sequence:**
1. Do not touch the person — call for help immediately
2. Hit the workshop emergency stop if available
3. If safe to do so: yank the service disconnect using insulated tools or a non-conductive rope/strap
4. Only after confirming HV isolation: approach and check for cardiac arrest
5. Call emergency services (Ethiopian emergency: 911)
6. Begin CPR/AED if trained — HV contact causes cardiac arrest; immediate CPR is critical
7. Do not move the person unless there is a fire or secondary hazard

**Post-incident:** The vehicle is now a potential evidence item in a safety investigation. Do not attempt to restore HV power. Secure the area and notify your senior management and, if applicable, the OEM technical support team.

---

## Common Mistakes Ethiopian Technicians Make in Early EV Training

1. **Treating a switched-off EV as safe** — The ignition being off does not isolate the HV system. Isolation requires the full procedure above.

2. **Removing the 12V battery but skipping the service disconnect** — The 12V battery disconnection removes low-voltage control systems only. The HV battery pack remains energised.

3. **Using a standard automotive multimeter to check HV** — A standard multimeter set to the highest voltage range will read HV circuit voltage, but it cannot assess insulation integrity. It also exposes the technician to HV if a probe contacts a live terminal incorrectly.

4. **Performing work without PPE "just for a quick check"** — There is no quick check on an HV system that is safe without PPE. The time spent putting on gloves and a face shield is not negotiable.

5. **Letting the service disconnect out of personal possession** — Once you remove the service disconnect, it stays with you. If it goes back in while you are working, the system is re-energised. Keep it in your pocket or on your person.

---

## Sources

- IEC 60903 — Rubber Insulating Gloves for Working Live (international standard for HV insulating gloves — class ratings, voltage thresholds, testing requirements)
- IEC 60900 — Insulating Hand Tools for Working Live (screwdrivers, pliers, cutters used near live parts)
- GB/T 18384 — Chinese National Standard for EV Electrical Safety (referenced in all Chinese OEM service manuals)
- UNECE WP.29 — Electric Vehicle Safety Regulations (applicable to export-market vehicles)
- Africa E-Mobility Alliance — EV Technician Training Framework for Sub-Saharan Markets (2025)

---

*Published by Youguard Academy · May 2026*
