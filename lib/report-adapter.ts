import { ReportDataV2, ReportData, RapportAnalyse } from "@/types";

/**
 * Convertit RapportAnalyse en texte formaté pour compatibilité avec l'ancien générateur PDF
 * Cette fonction transforme les données structurées en texte lisible
 */
function rapportAnalyseToText(rapport: RapportAnalyse): string {
  const sections: string[] = [];

  // Section CLIENT (si disponible)
  if (rapport.client && rapport.client.nom) {
    sections.push(`Client: ${rapport.client.civilite || ""} ${rapport.client.nom}`.trim());

    if (rapport.client.adresse_complete) {
      sections.push(`Adresse: ${rapport.client.adresse_complete}`);
    }

    if (rapport.client.telephone) {
      sections.push(`Téléphone: ${rapport.client.telephone}`);
    }

    if (rapport.client.email) {
      sections.push(`Email: ${rapport.client.email}`);
    }

    sections.push(""); // Ligne vide
  }

  // Section INSPECTION
  if (rapport.inspection) {
    sections.push(`Date d'inspection: ${rapport.inspection.date}`);

    if (rapport.inspection.technicien?.nom_complet) {
      sections.push(`Technicien: ${rapport.inspection.technicien.nom_complet}`);
    }

    if (rapport.inspection.description_services) {
      sections.push(`Services effectués: ${rapport.inspection.description_services}`);
    }

    sections.push(""); // Ligne vide
  }

  // Section DESCRIPTIF TECHNIQUE
  if (rapport.observations_techniques?.descriptif_technique) {
    sections.push("DESCRIPTIF TECHNIQUE");
    sections.push(rapport.observations_techniques.descriptif_technique);
    sections.push(""); // Ligne vide
  }

  // Section PISCINE
  if (rapport.piscine) {
    sections.push("CARACTÉRISTIQUES DE LA PISCINE");

    if (rapport.piscine.revetement?.type) {
      sections.push(`Revêtement: ${rapport.piscine.revetement.type}`);
      if (rapport.piscine.revetement.age) {
        sections.push(`Âge du revêtement: ${rapport.piscine.revetement.age}`);
      }
    }

    if (rapport.piscine.filtration?.type) {
      sections.push(`Type de filtration: ${rapport.piscine.filtration.type}`);
    }

    if (rapport.piscine.etat_des_lieux?.remplissage) {
      sections.push(`Remplissage: ${rapport.piscine.etat_des_lieux.remplissage}`);
    }

    if (rapport.piscine.etat_des_lieux?.etat_eau) {
      sections.push(`État de l'eau: ${rapport.piscine.etat_des_lieux.etat_eau}`);
    }

    sections.push(""); // Ligne vide
  }

  // Section LOCAL TECHNIQUE
  if (rapport.local_technique?.etat_general) {
    sections.push("LOCAL TECHNIQUE");
    sections.push(`État général: ${rapport.local_technique.etat_general}`);

    if (rapport.local_technique.observations) {
      sections.push(rapport.local_technique.observations);
    }

    if (rapport.local_technique.fuites_apparentes && rapport.local_technique.details_fuites) {
      sections.push(`⚠️ Fuites apparentes détectées: ${rapport.local_technique.details_fuites}`);
    }

    sections.push(""); // Ligne vide
  }

  // Section TESTS PIÈCES À SCELLER
  if (rapport.tests_effectues?.pieces_sceller?.resultats && rapport.tests_effectues.pieces_sceller.resultats.length > 0) {
    sections.push("TESTS DES PIÈCES À SCELLER");

    if (rapport.tests_effectues.pieces_sceller.methode) {
      sections.push(`Méthode: ${rapport.tests_effectues.pieces_sceller.methode}`);
    }

    rapport.tests_effectues.pieces_sceller.resultats.forEach((resultat) => {
      sections.push(`- ${resultat.element}: ${resultat.statut}`);
      if (resultat.details) {
        sections.push(`  ${resultat.details}`);
      }
    });

    sections.push(""); // Ligne vide
  }

  // Section TESTS D'ÉTANCHÉITÉ
  if (rapport.tests_effectues?.etancheite_revetement) {
    sections.push("TESTS D'ÉTANCHÉITÉ");

    if (rapport.tests_effectues.etancheite_revetement.methode) {
      sections.push(`Méthode: ${rapport.tests_effectues.etancheite_revetement.methode}`);
    }

    if (rapport.tests_effectues.etancheite_revetement.statut) {
      sections.push(`Résultat: ${rapport.tests_effectues.etancheite_revetement.statut}`);
    }

    if (rapport.tests_effectues.etancheite_revetement.details) {
      sections.push(rapport.tests_effectues.etancheite_revetement.details);
    }

    sections.push(""); // Ligne vide
  }

  // Section BILAN
  if (rapport.bilan) {
    sections.push("BILAN");

    if (rapport.bilan.conclusion_generale) {
      sections.push(rapport.bilan.conclusion_generale);
    }

    if (rapport.bilan.synthese && rapport.bilan.synthese.length > 0) {
      sections.push("");
      sections.push("Synthèse:");
      rapport.bilan.synthese.forEach((point) => {
        sections.push(`• ${point}`);
      });
    }

    if (rapport.bilan.fuites_detectees && rapport.bilan.details_fuites.length > 0) {
      sections.push("");
      sections.push("⚠️ Fuites détectées:");
      rapport.bilan.details_fuites.forEach((fuite) => {
        sections.push(`• ${fuite.localisation} - ${fuite.type} (Gravité: ${fuite.gravite})`);
      });
    }

    if (rapport.bilan.travaux_recommandes && rapport.bilan.travaux_recommandes.length > 0) {
      sections.push("");
      sections.push("Travaux recommandés:");
      rapport.bilan.travaux_recommandes.forEach((travaux) => {
        sections.push(`• ${travaux.type} (Urgence: ${travaux.urgence})`);
        sections.push(`  ${travaux.description}`);
      });
    }

    sections.push(""); // Ligne vide
  }

  // Section RESPONSABILITÉS / MENTIONS LÉGALES
  if (rapport.mentions_legales?.texte_complet) {
    sections.push("RESPONSABILITÉS ET MENTIONS LÉGALES");
    sections.push(rapport.mentions_legales.texte_complet);
    sections.push(""); // Ligne vide
  }

  // Informations sur les corrections (en bas du document)
  if (rapport.corrections_appliquees && rapport.corrections_appliquees.length > 0) {
    sections.push("");
    sections.push(`Note: ${rapport.corrections_appliquees.length} corrections linguistiques ont été appliquées automatiquement.`);
  }

  // Notes de l'analyseur (qualité du document)
  if (rapport.notes_analyseur) {
    sections.push("");
    sections.push(`Qualité du document source: ${rapport.notes_analyseur.qualite_document}`);

    if (rapport.notes_analyseur.commentaires) {
      sections.push(`Commentaires: ${rapport.notes_analyseur.commentaires}`);
    }
  }

  return sections.join("\n");
}

/**
 * Adapte ReportDataV2 (nouveau format avec RapportAnalyse)
 * vers ReportData (ancien format) pour compatibilité avec le générateur PDF existant
 */
export function adaptReportV2ToV1(reportV2: ReportDataV2): ReportData {
  const rapport = reportV2.analysedData;

  // Convertir le rapport analysé en texte formaté
  const correctedText = rapportAnalyseToText(rapport);

  // Créer un texte "original" simplifié (pour référence)
  const originalText = `Rapport d'inspection LOCAMEX - ${rapport.client.nom || "Client"} - ${rapport.inspection.date}`;

  // Adapter le format
  return {
    originalText: originalText,
    correctedText: correctedText,
    images: reportV2.images, // Les images sont déjà au bon format
    tables: reportV2.originalTables, // Les tableaux originaux extraits du DOCX
    metadata: {
      clientName: rapport.client.nom || undefined,
      address: rapport.client.adresse_complete || undefined,
      date: rapport.inspection.date || undefined,
      technicianName: rapport.inspection.technicien.nom_complet || undefined,
    },
  };
}

/**
 * Crée un tableau d'équipements à partir des données structurées
 */
export function createEquipmentsTable(rapport: RapportAnalyse): {
  title: string;
  headers: string[];
  rows: string[][];
} {
  const rows: string[][] = [];

  // Fonction helper pour ajouter un équipement
  const addEquipment = (nom: string, quantite: number | null, etat: string | null = null) => {
    if (quantite !== null && quantite > 0) {
      rows.push([nom, quantite.toString(), etat || "-"]);
    }
  };

  // Ajouter tous les équipements
  addEquipment("Skimmer", rapport.equipements.skimmer.quantite, rapport.equipements.skimmer.etat);
  addEquipment("Bonde de fond", rapport.equipements.bonde_fond.quantite, rapport.equipements.bonde_fond.etat);
  addEquipment("Refoulement", rapport.equipements.refoulement.quantite, rapport.equipements.refoulement.etat);
  addEquipment("Spot", rapport.equipements.spot.quantite, rapport.equipements.spot.etat);
  addEquipment("Prise balai", rapport.equipements.prise_balai.quantite, rapport.equipements.prise_balai.etat);
  addEquipment("Bonde bac volet", rapport.equipements.bonde_bac_volet.quantite, rapport.equipements.bonde_bac_volet.etat);
  addEquipment("Prise robot", rapport.equipements.prise_robot.quantite, rapport.equipements.prise_robot.etat);
  addEquipment("Balnéo", rapport.equipements.balneo.quantite, rapport.equipements.balneo.etat);

  if (rapport.equipements.nage_contre_courant.present) {
    addEquipment("Nage contre-courant", rapport.equipements.nage_contre_courant.quantite || 1, rapport.equipements.nage_contre_courant.etat);
  }

  addEquipment("Fontaine", rapport.equipements.fontaine.quantite, rapport.equipements.fontaine.etat);

  if (rapport.equipements.pompe_chaleur.present) {
    const details = [
      rapport.equipements.pompe_chaleur.marque,
      rapport.equipements.pompe_chaleur.modele
    ].filter(Boolean).join(" ");
    rows.push(["Pompe à chaleur", "1", details || rapport.equipements.pompe_chaleur.etat || "-"]);
  }

  // Ajouter les équipements "autres"
  if (rapport.equipements.autres && rapport.equipements.autres.length > 0) {
    rapport.equipements.autres.forEach((autre) => {
      addEquipment(autre.nom, autre.quantite);
    });
  }

  return {
    title: "ÉQUIPEMENTS DE LA PISCINE",
    headers: ["Équipement", "Quantité", "État"],
    rows: rows,
  };
}
