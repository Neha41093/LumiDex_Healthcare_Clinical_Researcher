export interface TherapeuticPreset {
  id: string;
  name: string;
  category: string;
  description: string;
  defaultQuery: string;
  keyInterventions: string[];
  keyEndpoints: string[];
  commercialTargetTAM: string;
  primaryCondition: string;
}

export const THERAPEUTIC_AREAS = [
  { id: 'all', label: 'All Therapeutics', icon: 'Layers' },
  { id: 'oncology', label: 'Oncology & Immuno-Onc', icon: 'Activity' },
  { id: 'cardiology', label: 'Cardiology & Metabolic', icon: 'Heart' },
  { id: 'neurology', label: 'Neurology & CNS', icon: 'Brain' },
  { id: 'immunology', label: 'Immunology & Autoimmune', icon: 'Shield' },
  { id: 'rare_disease', label: 'Rare Disease & Genomics', icon: 'Dna' },
  { id: 'infectious_disease', label: 'Infectious & Vaccines', icon: 'Bug' },
];

export const BENCHMARK_PRESETS: TherapeuticPreset[] = [
  {
    id: 'her2-breast',
    name: 'HER2+ Breast Cancer ADC Therapies',
    category: 'oncology',
    primaryCondition: 'HER2-Positive / Low Metastatic Breast Neoplasms',
    defaultQuery: 'HER2 breast cancer trastuzumab deruxtecan',
    description: 'Next-generation antibody-drug conjugates (ADCs) redefining progression-free and overall survival in metastatic and adjuvant settings.',
    keyInterventions: ['Trastuzumab deruxtecan (Enhertu)', 'T-DM1 (Kadcyla)', 'Tucatinib', 'Pertuzumab'],
    keyEndpoints: ['Progression-Free Survival (PFS)', 'Overall Survival (OS)', 'Objective Response Rate (ORR)', 'Interstitial Lung Disease (ILD) rate'],
    commercialTargetTAM: '$14.2B Global Market by 2028 (11.8% CAGR)'
  },
  {
    id: 'glp1-mace',
    name: 'GLP-1 Receptor Agonists (Semaglutide)',
    category: 'cardiology',
    primaryCondition: 'Type 2 Diabetes & Cardiovascular Risk',
    defaultQuery: 'GLP-1 semaglutide',
    description: 'Incretin mimetics demonstrating substantial reductions in 3-point Major Adverse Cardiovascular Events (MACE), heart failure hospitalizations, and renal progression.',
    keyInterventions: ['Semaglutide (Ozempic/Wegovy)', 'Tirzepatide (Mounjaro/Zepbound)', 'Dulaglutide', 'CagriSema'],
    keyEndpoints: ['3-Point MACE (CV Death, Non-fatal MI, Stroke)', 'HbA1c Reduction', 'Body Weight Loss (%)', 'Renal Composite Events'],
    commercialTargetTAM: '$100B+ Peak Global Market by 2030 (24.5% CAGR)'
  },
  {
    id: 'ad-amyloid',
    name: 'Early Alzheimer\'s (Lecanemab)',
    category: 'neurology',
    primaryCondition: 'Early Symptomatic Alzheimer\'s Disease',
    defaultQuery: 'Alzheimer lecanemab',
    description: 'Disease-modifying monoclonal antibodies targeting amyloid-beta protofibrils to slow cognitive decline alongside ARIA safety monitoring.',
    keyInterventions: ['Lecanemab (Leqembi)', 'Donanemab (Kisunla)', 'Aducanumab', 'Trontinemab (Brainshuttle)'],
    keyEndpoints: ['Clinical Dementia Rating-Sum of Boxes (CDR-SB)', 'ADAS-Cog14', 'Amyloid PET Centiloids', 'ARIA-E / ARIA-H incidence'],
    commercialTargetTAM: '$13.5B Global Market by 2029 (18.2% CAGR)'
  },
  {
    id: 'hfpef-sglt2',
    name: 'HFpEF SGLT2 Inhibitors (Empagliflozin)',
    category: 'cardiology',
    primaryCondition: 'Heart Failure with Preserved Ejection Fraction',
    defaultQuery: 'HFpEF empagliflozin',
    description: 'Cardiometabolic breakthrough establishing first guideline-directed medical therapy reducing cardiovascular death and heart failure hospitalization in HFpEF.',
    keyInterventions: ['Empagliflozin (Jardiance)', 'Dapagliflozin (Farxiga)', 'Finrenone (Kerendia)', 'Sacubitril/Valsartan'],
    keyEndpoints: ['CV Death or HF Hospitalization', 'KCCQ Physical Limitation Score', 'eGFR Slope Decline', 'NT-proBNP change'],
    commercialTargetTAM: '$16.8B Global Heart Failure Market'
  },
  {
    id: 'ibd-jak-il23',
    name: 'Ulcerative Colitis & IBD (Upadacitinib)',
    category: 'immunology',
    primaryCondition: 'Moderate-to-Severe Inflammatory Bowel Disease',
    defaultQuery: 'ulcerative colitis upadacitinib',
    description: 'JAK1 selective inhibitors and IL-23 p19 antagonists delivering mucosal healing, clinical remission, and steroid-free durability.',
    keyInterventions: ['Upadacitinib (Rinvoq)', 'Risankizumab (Skyrizi)', 'Mirikizumab (Omvoh)', 'Ustekinumab'],
    keyEndpoints: ['Endoscopic Mucosal Healing', 'Clinical Remission (Mayo Score / CDAI)', 'Histologic-Endoscopic Remission', 'Infection Signals'],
    commercialTargetTAM: '$28.4B Global IBD Therapeutics Market'
  },
  {
    id: 'car-t-myeloma',
    name: 'BCMA-Targeted CAR-T & Bispecifics in Multiple Myeloma',
    category: 'rare_disease',
    primaryCondition: 'Relapsed/Refractory Multiple Myeloma (RRMM)',
    defaultQuery: 'CAR-T cell therapy BCMA multiple myeloma ide-cel cilta-cel',
    description: 'Autologous engineered T-cell therapies achieving deep minimal residual disease (MRD) negativity in heavily pretreated hematologic malignancy.',
    keyInterventions: ['Ciltacabtagene autoleucel (Carvykti)', 'Idecabtagene vicleucel (Abecma)', 'Teclistamab', 'Elranatamab'],
    keyEndpoints: ['Overall Response Rate (ORR)', 'MRD Negativity Rate (10^-5)', 'PFS Duration', 'Cytokine Release Syndrome (CRS) Grade >=3'],
    commercialTargetTAM: '$9.6B Multiple Myeloma Cell & Gene Market'
  }
];

export const PYTHON_CODE_TEMPLATES = [
  {
    title: 'Full Pipeline Scraper (CLI)',
    file: 'scraper_cli.py',
    description: 'The master Python script with PubMed E-Utilities, ClinicalTrials.gov v2 REST, Europe PMC, and Healthcare Datasets.'
  },
  {
    title: 'Commercial & Market Potential Analyzer',
    file: 'commercial_analyzer.py',
    description: 'Python engine evaluating industry vs academic trial ratios, Phase 3 maturity scores, and market dynamics.'
  },
  {
    title: 'Custom Python Query Snippet',
    file: 'custom_snippet',
    description: 'Interactive editable Python script using urllib to query live biomedical endpoints directly from browser.',
    templateCode: `# Interactive Python Healthcare Scraper
import urllib.request
import json

query = "oncology immunotherapy pembrolizumab"
url = f"https://clinicaltrials.gov/api/v2/studies?query.term={urllib.parse.quote(query)}&pageSize=5&format=json"

req = urllib.request.Request(url, headers={"User-Agent": "LumiDexLab/1.0"})
with urllib.request.urlopen(req, timeout=10) as resp:
    data = json.loads(resp.read().decode())
    studies = data.get("studies", [])
    print(f"Scraped {len(studies)} ClinicalTrials.gov studies:")
    for s in studies:
        proto = s.get("protocolSection", {})
        nct = proto.get("identificationModule", {}).get("nctId")
        title = proto.get("identificationModule", {}).get("briefTitle")
        phase = proto.get("designModule", {}).get("phases", ["N/A"])
        sponsor = proto.get("sponsorCollaboratorsModule", {}).get("leadSponsor", {}).get("name")
        print(f" • [{nct}] ({'/'.join(phase)}): {title[:70]}... | Sponsor: {sponsor}")
`
  }
];
