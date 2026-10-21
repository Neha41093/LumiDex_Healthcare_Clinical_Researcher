#!/usr/bin/env python3
"""
Commercial and Market Analytics Engine for Healthcare & Biopharma
Evaluates market maturity, commercial pipeline crowding, patent cliff horizon,
and clinical trial sponsor distribution.
"""

import sys
import json

def analyze_commercial_potential(data):
    """
    Computes commercial indicators:
    - Sponsor distribution (Big Pharma vs Biotech vs Academia)
    - Phase maturity
    - Patient burden & enrollment capacity
    - Competitive intensity
    """
    trials = data.get("verified_studies", {}).get("clinical_trials", [])
    literature = data.get("verified_studies", {}).get("pubmed_literature", [])
    
    total_trials = len(trials)
    industry_trials = [t for t in trials if t.get("is_commercial_industry")]
    p3_trials = [t for t in trials if "3" in t.get("phase", "")]
    p2_trials = [t for t in trials if "2" in t.get("phase", "")]
    
    # Sponsors list
    sponsors = {}
    for t in trials:
        sp = t.get("sponsor", "Unknown")
        sponsors[sp] = sponsors.get(sp, 0) + 1
        
    top_sponsors = sorted([{"name": k, "trials": v} for k, v in sponsors.items()], key=lambda x: x["trials"], reverse=True)[:6]
    
    # Estimate Commercial Opportunity Rating
    commercial_score = 50
    if len(p3_trials) >= 2:
        commercial_score += 25
    elif len(p2_trials) >= 2:
        commercial_score += 15
        
    if len(industry_trials) > total_trials * 0.4:
        commercial_score += 15
    if len(literature) > 5:
        commercial_score += 10
        
    commercial_score = min(commercial_score, 98)
    
    return {
        "commercial_score": commercial_score,
        "market_readiness": "Near-term Commercial Launch (Phase 3 Assets Present)" if len(p3_trials) > 0 else "Mid-stage Clinical Proof-of-Concept",
        "top_sponsors": top_sponsors,
        "industry_trial_count": len(industry_trials),
        "academic_trial_count": total_trials - len(industry_trials),
        "total_active_pipeline_patients": sum(t.get("enrollment", 0) for t in trials),
        "market_dynamics": {
            "competitive_crowding": "High" if len(trials) >= 6 else ("Moderate" if len(trials) >= 3 else "Low / Orphan Potential"),
            "reimbursement_complexity": "High (Biologic / Cell / Specialty Tier)" if any("car-t" in t.get("title", "").lower() or "antibody" in t.get("title", "").lower() for t in trials) else "Standard Specialty Pharmacy",
            "regulatory_pathways": ["Breakthrough Therapy", "Fast Track", "Priority Review"] if commercial_score > 75 else ["Standard Review", "Orphan Drug Designation"]
        }
    }

if __name__ == "__main__":
    if len(sys.argv) > 1:
        with open(sys.argv[1], "r", encoding="utf-8") as f:
            input_data = json.load(f)
        analysis = analyze_commercial_potential(input_data)
        print(json.dumps(analysis, indent=2))
    else:
        print(json.dumps({"error": "No input JSON file provided"}))
