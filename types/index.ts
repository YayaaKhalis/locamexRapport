/**
 * Types pour le projet LOCAMEX
 */

// Étapes du processus de traitement
export type ProcessingStep =
  | 'idle'
  | 'uploading'
  | 'extracting'
  | 'correcting'
  | 'generating'
  | 'completed'
  | 'error';

// Données extraites du fichier Word
export interface ExtractedData {
  text: string;
  images: ImageData[];
  tables: TableData[];
}

// Type d'image identifié par l'IA
export type ImageType = 'piscine' | 'manometre' | 'local_technique' | 'equipement' | 'couverture_rapport' | 'autre';

// Qualité d'image évaluée par l'IA
export type ImageQuality = 'bonne' | 'moyenne' | 'floue';

// Taille recommandée pour l'affichage
export type ImageSize = 'grande' | 'petite';

// Métadonnées d'analyse d'image par GPT-4 Vision
export interface ImageAnalysis {
  type: ImageType;
  quality: ImageQuality;
  sizeRecommendation: ImageSize;
  description: string;
  displayPriority: number; // 1-10, 1 = afficher en premier
}

// Données d'une image
export interface ImageData {
  base64: string;
  contentType?: string;
  width?: number;
  height?: number;
  caption?: string;
  analysis?: ImageAnalysis; // Métadonnées ajoutées par GPT-4 Vision
}

// Données d'un tableau
export interface TableData {
  title?: string; // Titre du tableau (ex: "DESCRIPTIF TECHNIQUE", "ÉQUIPEMENTS")
  headers: string[];
  rows: string[][];
}

// Données du rapport (ancienne version - deprecated)
export interface ReportData {
  originalText: string;
  correctedText: string;
  images: ImageData[];
  tables: TableData[];
  metadata?: ReportMetadata;
}

// Métadonnées du rapport (ancienne version - deprecated)
export interface ReportMetadata {
  clientName?: string;
  address?: string;
  date?: string;
  technicianName?: string;
}

// État du traitement
export interface ProcessingState {
  step: ProcessingStep;
  progress: number;
  message: string;
  error?: string;
}

// ============================================
// TYPES POUR L'ANALYSE UNIVERSELLE (v2.0)
// ============================================

export type QualiteExtraction = 'complete' | 'partielle' | 'incomplete';
export type QualiteDocument = 'excellente' | 'bonne' | 'moyenne' | 'faible';
export type TypeCorrection = 'orthographe' | 'grammaire' | 'ponctuation' | 'format';
export type StatutConformite = 'Conforme' | 'Non conforme' | 'À surveiller';
export type GraviteProbleme = 'Mineure' | 'Moyenne' | 'Importante' | 'Critique';
export type UrgenceTravaux = 'Immédiate' | 'Court terme' | 'Moyen terme' | 'Long terme';

export interface AnalyseurMetadata {
  version: string;
  date_analyse: string;
  source: string;
  qualite_extraction: QualiteExtraction;
}

export interface ClientInfo {
  civilite: string | null;
  nom: string | null;
  prenom: string | null;
  adresse_complete: string | null;
  adresse: {
    numero: string | null;
    voie: string | null;
    code_postal: string | null;
    ville: string | null;
  };
  telephone: string | null;
  mobile: string | null;
  email: string | null;
}

export interface InspectionInfo {
  date: string;
  date_iso: string;
  technicien: {
    nom: string | null;
    prenom: string | null;
    nom_complet: string | null;
  };
  recommande_par: string | null;
  services_effectues: string[];
  description_services: string | null;
  duree_intervention: string | null;
  heure_debut: string | null;
  heure_fin: string | null;
}

export interface RevetementInfo {
  type: string | null;
  type_detail: string | null;
  age: string | null;
  age_annees: number | null;
  etat_general: string | null;
  observations: string | null;
}

export interface FiltrationInfo {
  type: string | null;
  type_detail: string | null;
  pompe: string | null;
  filtre: string | null;
}

export interface DimensionsInfo {
  longueur: string | null;
  largeur: string | null;
  profondeur_min: string | null;
  profondeur_max: string | null;
  volume: string | null;
  forme: string | null;
}

export interface EtatDesLieux {
  remplissage: string | null;
  niveau_eau: string | null;
  etat_eau: string | null;
  temperature_eau: string | null;
  ph: string | null;
}

export interface PiscineInfo {
  revetement: RevetementInfo;
  filtration: FiltrationInfo;
  dimensions: DimensionsInfo;
  etat_des_lieux: EtatDesLieux;
}

export interface EquipementBase {
  quantite: number | null;
  etat: string | null;
  observations: string | null;
}

export interface EquipementSpot extends EquipementBase {
  type: string | null;
}

export interface EquipementBalneo extends EquipementBase {
  type: string | null;
}

export interface EquipementNCC {
  present: boolean;
  quantite: number | null;
  etat: string | null;
  observations: string | null;
}

export interface EquipementMAN {
  present: boolean;
  type: string | null;
  etat: string | null;
  observations: string | null;
}

export interface EquipementPAC {
  present: boolean;
  marque: string | null;
  modele: string | null;
  etat: string | null;
  observations: string | null;
}

export interface EquipementChauffage {
  type: string | null;
  observations: string | null;
}

export interface EquipementAutre {
  nom: string;
  quantite: number | null;
  description: string | null;
}

export interface EquipementsInfo {
  skimmer: EquipementBase;
  bonde_fond: EquipementBase;
  refoulement: EquipementBase;
  spot: EquipementSpot;
  prise_balai: EquipementBase;
  bonde_bac_volet: EquipementBase;
  prise_robot: EquipementBase;
  balneo: EquipementBalneo;
  nage_contre_courant: EquipementNCC;
  fontaine: EquipementBalneo;
  mise_niveau_auto: EquipementMAN;
  pompe_chaleur: EquipementPAC;
  chauffage: EquipementChauffage;
  autres: EquipementAutre[];
}

export interface LocalTechniqueInfo {
  etat_general: string | null;
  observations: string | null;
  fuites_apparentes: boolean;
  details_fuites: string | null;
  equipements: string | null;
}

export interface ResultatTest {
  element: string;
  statut: StatutConformite;
  details: string | null;
}

export interface TestsCanalisations {
  methode: string | null;
  pression_test: string | null;
  duree_test: string | null;
  resultats: ResultatTest[];
}

export interface TestsPiecesSceller {
  methode: string | null;
  resultats: ResultatTest[];
}

export interface TestEtancheiteRevetement {
  methode: string | null;
  statut: StatutConformite | null;
  zones_testees: string | null;
  details: string | null;
}

export interface AutreTest {
  nom: string;
  methode: string;
  resultat: string;
}

export interface TestsEffectues {
  canalisations: TestsCanalisations;
  pieces_sceller: TestsPiecesSceller;
  etancheite_revetement: TestEtancheiteRevetement;
  autres_tests: AutreTest[];
}

export interface ConformiteElement {
  element: string;
  statut: StatutConformite;
  observations: string | null;
}

export interface ConformitePieceSceller {
  element: string;
  numero: number | null;
  statut: StatutConformite;
  observations: string | null;
}

export interface ConformiteEtancheite {
  revetement: StatutConformite | null;
  structure: StatutConformite | string | null;
  observations: string | null;
}

export interface ConformiteInfo {
  canalisations: ConformiteElement[];
  pieces_sceller: ConformitePieceSceller[];
  etancheite: ConformiteEtancheite;
}

export interface ProblemeDetecte {
  type: string;
  gravite: GraviteProbleme;
  description: string;
  localisation: string | null;
  recommandations: string | null;
}

export interface ObservationsTechniques {
  descriptif_technique: string | null;
  problemes_detectes: ProblemeDetecte[];
  points_attention: string[];
  remarques: string | null;
}

export interface DetailFuite {
  localisation: string;
  type: string;
  gravite: string;
}

export interface TravauxRecommande {
  type: string;
  urgence: UrgenceTravaux;
  description: string;
}

export interface BilanInfo {
  synthese: string[];
  conclusion_generale: string | null;
  fuites_detectees: boolean;
  details_fuites: DetailFuite[];
  travaux_recommandes: TravauxRecommande[];
  mesures_conservatoires: string | null;
}

export interface MentionsLegales {
  texte_complet: string | null;
  sections: {
    responsabilite: string | null;
    limites_mission: string | null;
    mesures_conservatoires: string | null;
    garanties: string | null;
    precision_tests: string | null;
    validite_diagnostic: string | null;
    reparations: string | null;
  };
}

export interface CorrectionAppliquee {
  type: TypeCorrection;
  original: string;
  corrige: string;
}

export interface NotesAnalyseur {
  sections_manquantes: string[];
  informations_incompletes: string[];
  qualite_document: QualiteDocument;
  commentaires: string | null;
}

export interface RapportAnalyse {
  metadata: AnalyseurMetadata;
  client: ClientInfo;
  inspection: InspectionInfo;
  piscine: PiscineInfo;
  equipements: EquipementsInfo;
  local_technique: LocalTechniqueInfo;
  tests_effectues: TestsEffectues;
  conformite: ConformiteInfo;
  observations_techniques: ObservationsTechniques;
  bilan: BilanInfo;
  mentions_legales: MentionsLegales;
  corrections_appliquees: CorrectionAppliquee[];
  notes_analyseur: NotesAnalyseur;
}

export interface StatistiquesAnalyse {
  champs_remplis: number;
  champs_totaux: number;
  taux_completion: number;
  corrections_appliquees: number;
  sections_manquantes: number;
}

export interface ReponseAnalyseur {
  statut: 'success' | 'warning' | 'error';
  message: string;
  donnees: RapportAnalyse;
  statistiques: StatistiquesAnalyse;
}

// Données du rapport enrichies (nouvelle version v2.0)
export interface ReportDataV2 {
  analysedData: RapportAnalyse;
  images: ImageData[];
  originalTables: TableData[];
}
