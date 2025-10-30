// lmic_project_config.h — MCCI LMIC minimal config for LoRa32u4 II (SX1276)
#ifndef _LMIC_PROJECT_CONFIG_H_
#define _LMIC_PROJECT_CONFIG_H_

// ---------- Region (pick ONE) ----------
#define CFG_eu868 1
// #define CFG_us915 1
// #define CFG_au915 1
// #define CFG_as923 1
// #define CFG_in866 1
// #define CFG_kr920 1
// #define CFG_cn779 1
// #define CFG_cn470 1

// ---------- Radio ----------
// LoRa32u4 II uses the Semtech SX1276
#define CFG_sx1276_radio 1

// ---------- Trim features to save flash/RAM ----------
#define DISABLE_PING 1            // no Class B
#define DISABLE_BEACONS 1         // no beacon tracking
#define LMIC_ENABLE_DeviceTimeReq 0

// ---------- Join mode ----------
// Keep OTAA enabled by default (do NOT define DISABLE_JOIN).
// If you switch to ABP to save more memory, uncomment the next line
// and set session keys with LMIC_setSession(...):
// #define DISABLE_JOIN 1

#endif // _LMIC_PROJECT_CONFIG_H_
