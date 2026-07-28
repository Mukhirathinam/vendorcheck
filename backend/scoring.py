def calculate_trust_score(mca_data: dict, gst_data: dict, ecourts_data: dict) -> dict:
    score = 100
    flags = []

    # Mock GST logic
    gst_status = gst_data.get("status", "Active")
    if gst_status == "Suspended":
        score -= 50
        flags.append({"source": "GST", "severity": "CRITICAL", "description": "GST Registration is Suspended"})
    elif gst_status == "Cancelled":
        score -= 50
        flags.append({"source": "GST", "severity": "CRITICAL", "description": "GST Registration is Cancelled"})

    # Mock MCA logic
    mca_status = mca_data.get("company_status", "Active")
    if mca_status == "Struck Off":
        score -= 50
        flags.append({"source": "MCA", "severity": "CRITICAL", "description": "Company is Struck Off"})

    if mca_data.get("nclt_proceedings", False):
        score -= 40
        flags.append({"source": "NCLT", "severity": "CRITICAL", "description": "Active insolvency proceedings found"})

    recommendation = "Safe to proceed"
    if score < 50:
        recommendation = "Serious risk, do not pay advance"
    elif score < 75:
        recommendation = "Proceed with caution on flagged items"

    return {
        "trust_score": score,
        "flags": flags,
        "recommendation": recommendation
    }
