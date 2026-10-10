import React, { createContext, useContext, useState, useEffect } from 'react';

export type LanguageCode = 'en' | 'es' | 'fr' | 'de' | 'it' | 'pt' | 'ja';

export interface LanguageOption {
  code: LanguageCode;
  label: string;
  nativeName: string;
  flag: string;
}

export const SUPPORTED_LANGUAGES: LanguageOption[] = [
  { code: 'en', label: 'English', nativeName: 'English', flag: '🇺🇸' },
  { code: 'es', label: 'Spanish', nativeName: 'Español', flag: '🇪🇸' },
  { code: 'fr', label: 'French', nativeName: 'Français', flag: '🇫🇷' },
  { code: 'de', label: 'German', nativeName: 'Deutsch', flag: '🇩🇪' },
  { code: 'it', label: 'Italian', nativeName: 'Italiano', flag: '🇮🇹' },
  { code: 'pt', label: 'Portuguese', nativeName: 'Português', flag: '🇵🇹' },
  { code: 'ja', label: 'Japanese', nativeName: '日本語', flag: '🇯🇵' },
];

export const TRANSLATIONS: Record<LanguageCode, Record<string, string>> = {
  en: {
    // Navigation
    'nav.this_week': 'This Week',
    'nav.calendar': 'Calendar',
    'nav.beds': 'My Beds',
    'nav.chat': 'Advisor Chat',
    'nav.maps': 'Nurseries (Maps)',
    'nav.search': 'Frost Alerts (Search)',
    'nav.guide': 'Frost Guide',
    'nav.voice_call': 'Voice Call',

    // Banner & General
    'banner.last_spring_frost': 'Last Spring Frost',
    'banner.first_fall_frost': 'First Fall Frost',
    'banner.frost_free_window': 'Frost-Free Window',
    'banner.change_dates': 'Change Frost Dates',
    'banner.imminent_frost': 'First frost is expected in approximately',
    'banner.imminent_frost_desc': 'days. Pick all mature green tomatoes and peppers, cure pumpkins/squash, and prepare frost blankets.',
    'banner.viewing_week': 'Viewing Week',
    'banner.reset_today': 'Reset to Current Week',
    'banner.days': 'days',

    // This Week View
    'schedule.title': 'What to Plant This Week',
    'schedule.title_custom': 'Planting Schedule for Week',
    'schedule.subtitle': 'Recommended planting window for',
    'schedule.print': 'Print Checklist',
    'schedule.search_placeholder': 'Filter by crop name (e.g. Garlic, Spinach, Tomato)...',
    'schedule.tolerance': 'Frost Tolerance:',
    'schedule.all_tolerances': 'All Tolerances',
    'schedule.hardy': 'Frost Hardy',
    'schedule.semi_hardy': 'Semi-Hardy',
    'schedule.tender': 'Tender (Frost Sensitive)',
    'schedule.category': 'Category:',
    'schedule.all_crops': 'All Crops',
    'schedule.imminent_watch': 'Imminent Frost Watch: Protect or Harvest',
    'schedule.overwinter': 'Plant for Overwintering & Spring Harvest',
    'schedule.overwinter_desc': 'Fall-planted crops that establish root systems before hard freeze and yield early harvests next spring.',
    'schedule.direct_sow': 'Direct Sow Outdoors in Beds',
    'schedule.direct_sow_desc': 'Plant seeds directly into prepared garden beds or containers at recommended depth.',
    'schedule.indoor_start': 'Start Seeds Indoors Under Lights',
    'schedule.indoor_start_desc': 'Tender crops and long-season vegetables started in starter trays before the last frost.',
    'schedule.transplant': 'Transplant Seedlings Outdoors',
    'schedule.transplant_desc': 'Hardened-off starts ready to transition from trays into outdoor garden beds.',
    'schedule.no_plants': 'No crops matching this filter scheduled for Week',
    'schedule.view_all': 'Reset Filters',

    // Plant Card
    'card.window': 'Window',
    'card.soil_temp_min': 'Soil Temp Min:',
    'card.spacing': 'Plant Spacing:',
    'card.depth': 'Sow Depth:',
    'card.days_to_harvest': 'days to harvest',
    'card.add_to_beds': 'Add to Beds',
    'card.details': 'Details',

    // My Beds
    'beds.header': 'Active Garden Beds & Log',
    'beds.title': 'My Garden Beds & Plantings',
    'beds.subtitle': 'Track what you’ve sown, monitor projected harvest dates, and organize your seasonal crop rotations.',
    'beds.new_bed': 'New Garden Bed',
    'beds.create_title': 'Create New Garden Bed or Container',
    'beds.bed_name': 'Bed Name / Location',
    'beds.bed_type': 'Bed Type',
    'beds.save_bed': 'Save Bed',
    'beds.cancel': 'Cancel',
    'beds.plantings_logged': 'plantings logged',
    'beds.empty': 'This bed has no plantings logged yet.',
    'beds.empty_cta': 'Go to "This Week" and click "Add to Beds" to populate this bed!',
    'beds.guide': 'Guide',
    'beds.sown': 'Sown:',
    'beds.method': 'Method:',
    'beds.harvest_btn': 'Harvest ✓',
    'beds.ready': 'Ready for harvest!',
    'beds.days_left': 'days to harvest',
    'beds.harvested_history': 'Harvested & Completed',
    'beds.restore': 'Restore to active',

    // Language & Theme
    'theme.appearance': 'Appearance',
    'theme.light': 'Light Mode',
    'theme.dark': 'Dark Mode',
    'theme.auto': 'Auto (System)',
    'lang.language': 'Language',

    // Companion Planting
    'companion.guide_title': 'Companion Planting Guide',
    'companion.all_neighbors': 'All Neighbors',
    'companion.friendly_allies': 'Friendly Allies',
    'companion.unfriendly_foes': 'Incompatible / Avoid',
    'companion.bed_alerts': 'In Your Garden Beds',
    'companion.how_it_works': 'How Companion Planting Works',
    'companion.hide_principles': 'Hide Botanical Principles',

    // Weather Forecast & Frost Risks
    'weather.forecast_title': 'Weather & Frost Risk Forecast',
    'weather.live_radar': 'Live Open-Meteo Radar',
    'weather.current_conditions': 'Current Conditions',
    'weather.frost_risk_7d': '7-Day Frost Risk Outlook',
    'weather.no_frost_7d': 'No frost predicted in the next 7 days',
    'weather.hard_freeze_alert': 'Hard Freeze Warning (≤ 28°F)',
    'weather.frost_warning_alert': 'Frost & Freeze Alert (29–32°F)',
    'weather.ground_frost_watch': 'Ground Frost Watch (33–36°F)',
    'weather.heat_alert': 'Extreme Heat Warning (≥ 92°F)',
    'weather.wind_alert': 'High Wind & Storm Warning',
    'weather.view_7day': '7-Day Weather & Garden Risks',
    'weather.hide_7day': 'Hide 7-Day Forecast',
    'weather.refresh': 'Refresh Forecast',
    'weather.precip': 'Precipitation',
    'weather.wind': 'Wind & Gusts',
    'weather.action_tips': 'Garden Protection Advice',
    'weather.scenarios': 'Test Weather Scenarios',
  },

  es: {
    // Navigation
    'nav.this_week': 'Esta Semana',
    'nav.calendar': 'Calendario',
    'nav.beds': 'Mis Bancales',
    'nav.chat': 'Asesor Chat',
    'nav.maps': 'Viveros (Maps)',
    'nav.search': 'Alertas de Heladas',
    'nav.guide': 'Guía de Heladas',
    'nav.voice_call': 'Llamada de Voz',

    // Banner & General
    'banner.last_spring_frost': 'Última Helada de Primavera',
    'banner.first_fall_frost': 'Primera Helada de Otoño',
    'banner.frost_free_window': 'Período Libre de Heladas',
    'banner.change_dates': 'Cambiar Fechas de Helada',
    'banner.imminent_frost': 'Se espera la primera helada en aproximadamente',
    'banner.imminent_frost_desc': 'días. Coseche tomates y pimientos maduros, y prepare mantas térmicas.',
    'banner.viewing_week': 'Semana',
    'banner.reset_today': 'Volver a la Semana Actual',
    'banner.days': 'días',

    // This Week View
    'schedule.title': 'Qué Sembrar Esta Semana',
    'schedule.title_custom': 'Calendario de Siembra para la Semana',
    'schedule.subtitle': 'Período de siembra recomendado para',
    'schedule.print': 'Imprimir Lista',
    'schedule.search_placeholder': 'Filtrar por cultivo (ej. Ajo, Espinaca, Tomate)...',
    'schedule.tolerance': 'Tolerancia a Heladas:',
    'schedule.all_tolerances': 'Todas las Tolerancias',
    'schedule.hardy': 'Muy Resistente (Hardy)',
    'schedule.semi_hardy': 'Semi-Resistente',
    'schedule.tender': 'Sensible a Heladas',
    'schedule.category': 'Categoría:',
    'schedule.all_crops': 'Todos los Cultivos',
    'schedule.imminent_watch': 'Alerta de Helada Inminente: Proteger o Cosechar',
    'schedule.overwinter': 'Siembra para Invernar y Cosecha Temprana',
    'schedule.overwinter_desc': 'Cultivos plantados en otoño que desarrollan raíces antes de las heladas y rinden en primavera.',
    'schedule.direct_sow': 'Siembra Directa al Aire Libre',
    'schedule.direct_sow_desc': 'Siembre las semillas directamente en el suelo o en bancales preparados.',
    'schedule.indoor_start': 'Semillero Interior Bajo Luces',
    'schedule.indoor_start_desc': 'Cultivos sensibles iniciados en bandejas de germinación antes de la última helada.',
    'schedule.transplant': 'Trasplante al Huerto Exterior',
    'schedule.transplant_desc': 'Plántulas aclimatadas listas para ser trasplantadas al huerto.',
    'schedule.no_plants': 'No hay cultivos programados con este filtro para la Semana',
    'schedule.view_all': 'Restablecer Filtros',

    // Plant Card
    'card.window': 'Ventana',
    'card.soil_temp_min': 'Temp. Suelo Mín:',
    'card.spacing': 'Distancia:',
    'card.depth': 'Profundidad:',
    'card.days_to_harvest': 'días para cosecha',
    'card.add_to_beds': 'Añadir al Bancal',
    'card.details': 'Detalles',

    // My Beds
    'beds.header': 'Bancales Activos y Registro',
    'beds.title': 'Mis Bancales y Cultivos',
    'beds.subtitle': 'Controle lo sembrado, fechas estimadas de recolección y rotaciones de cultivos.',
    'beds.new_bed': 'Nuevo Bancal',
    'beds.create_title': 'Crear Nuevo Bancal o Contenedor',
    'beds.bed_name': 'Nombre del Bancal / Ubicación',
    'beds.bed_type': 'Tipo de Bancal',
    'beds.save_bed': 'Guardar Bancal',
    'beds.cancel': 'Cancelar',
    'beds.plantings_logged': 'cultivos registrados',
    'beds.empty': 'Este bancal no tiene cultivos aún.',
    'beds.empty_cta': '¡Vaya a "Esta Semana" y pulse "Añadir al Bancal"!',
    'beds.guide': 'Ficha',
    'beds.sown': 'Sembrado:',
    'beds.method': 'Método:',
    'beds.harvest_btn': 'Cosechar ✓',
    'beds.ready': '¡Listo para cosechar!',
    'beds.days_left': 'días para cosecha',
    'beds.harvested_history': 'Cosechado y Completado',
    'beds.restore': 'Reactivar cultivo',

    // Language & Theme
    'theme.appearance': 'Apariencia',
    'theme.light': 'Modo Claro',
    'theme.dark': 'Modo Oscuro',
    'theme.auto': 'Automático (Sistema)',
    'lang.language': 'Idioma',

    // Companion Planting
    'companion.guide_title': 'Guía de Plantas Compañeras',
    'companion.all_neighbors': 'Todos los Vecinos',
    'companion.friendly_allies': 'Aliados Beneficiosos',
    'companion.unfriendly_foes': 'Incompatibles / Evitar',
    'companion.bed_alerts': 'En Tus Bancales',
    'companion.how_it_works': 'Cómo Funciona la Siembra Asociada',
    'companion.hide_principles': 'Ocultar Principios Botánicos',

    // Weather Forecast & Frost Risks
    'weather.forecast_title': 'Pronóstico Meteorológico y Riesgo de Heladas',
    'weather.live_radar': 'Radar Open-Meteo en Vivo',
    'weather.current_conditions': 'Condiciones Actuales',
    'weather.frost_risk_7d': 'Riesgo de Heladas a 7 Días',
    'weather.no_frost_7d': 'Sin riesgo de heladas en los próximos 7 días',
    'weather.hard_freeze_alert': 'Alerta de Helada Fuerte (≤ -2.2°C)',
    'weather.frost_warning_alert': 'Alerta de Helada (-1.7 a 0°C)',
    'weather.ground_frost_watch': 'Aviso de Helada Superficial (0.5 a 2.2°C)',
    'weather.heat_alert': 'Alerta de Calor Extremo (≥ 33°C)',
    'weather.wind_alert': 'Alerta de Vientos Fuertes y Tormentas',
    'weather.view_7day': 'Pronóstico de 7 Días y Riesgos',
    'weather.hide_7day': 'Ocultar Pronóstico',
    'weather.refresh': 'Actualizar',
    'weather.precip': 'Precipitación',
    'weather.wind': 'Viento y Rachas',
    'weather.action_tips': 'Consejos de Protección para el Huerto',
    'weather.scenarios': 'Probar Escenarios de Clima',
  },

  fr: {
    // Navigation
    'nav.this_week': 'Cette Semaine',
    'nav.calendar': 'Calendrier',
    'nav.beds': 'Mes Carrés',
    'nav.chat': 'Conseiller IA',
    'nav.maps': 'Pépinières (Maps)',
    'nav.search': 'Alertes Gel',
    'nav.guide': 'Guide du Gel',
    'nav.voice_call': 'Appel Vocal',

    // Banner & General
    'banner.last_spring_frost': 'Dernier Gel de Printemps',
    'banner.first_fall_frost': 'Premier Gel d’Automne',
    'banner.frost_free_window': 'Période Sans Gel',
    'banner.change_dates': 'Modifier les Dates de Gel',
    'banner.imminent_frost': 'Premier gel prévu dans environ',
    'banner.imminent_frost_desc': 'jours. Récoltez tomates et poivrons, et installez des voiles d’hivernage.',
    'banner.viewing_week': 'Semaine',
    'banner.reset_today': 'Semaine Actuelle',
    'banner.days': 'jours',

    // This Week View
    'schedule.title': 'Que Planter Cette Semaine',
    'schedule.title_custom': 'Calendrier de Semis pour la Semaine',
    'schedule.subtitle': 'Fenêtre de semis recommandée pour',
    'schedule.print': 'Imprimer la Liste',
    'schedule.search_placeholder': 'Filtrer par légume (ex: Ail, Épinard, Tomate)...',
    'schedule.tolerance': 'Tolérance au Gel :',
    'schedule.all_tolerances': 'Toutes les Tolérances',
    'schedule.hardy': 'Très Rustique',
    'schedule.semi_hardy': 'Semi-Rustique',
    'schedule.tender': 'Gélif (Sensible)',
    'schedule.category': 'Catégorie :',
    'schedule.all_crops': 'Tous les Légumes',
    'schedule.imminent_watch': 'Alerte Gel Imminent : Protéger ou Récolter',
    'schedule.overwinter': 'Semis d’Hivernage & Récolte de Printemps',
    'schedule.overwinter_desc': 'Légumes d’automne qui s’enracinent avant l’hiver pour donner de primeurs au printemps.',
    'schedule.direct_sow': 'Semis Direct en Pleine Terre',
    'schedule.direct_sow_desc': 'Semez directement en place dans les planches potagères préparées.',
    'schedule.indoor_start': 'Semis d’Intérieur sous Lampe',
    'schedule.indoor_start_desc': 'Légumes d’été nécessitant de la chaleur avant les saints de glace.',
    'schedule.transplant': 'Repiquage au Potager',
    'schedule.transplant_desc': 'Plants endurcis prêts à être mis en terre.',
    'schedule.no_plants': 'Aucun légume prévu pour la Semaine',
    'schedule.view_all': 'Réinitialiser les Filtres',

    // Plant Card
    'card.window': 'Période',
    'card.soil_temp_min': 'Temp. Sol Min :',
    'card.spacing': 'Espacement :',
    'card.depth': 'Profondeur :',
    'card.days_to_harvest': 'jours avant récolte',
    'card.add_to_beds': 'Ajouter au Carré',
    'card.details': 'Fiche',

    // My Beds
    'beds.header': 'Planches et Journaux de Culture',
    'beds.title': 'Mes Planches Potagères',
    'beds.subtitle': 'Suivez vos semis, prévisions de récolte et rotation des cultures.',
    'beds.new_bed': 'Nouveau Carré',
    'beds.create_title': 'Créer une Planche ou un Bac',
    'beds.bed_name': 'Nom / Emplacement',
    'beds.bed_type': 'Type de Culture',
    'beds.save_bed': 'Enregistrer',
    'beds.cancel': 'Annuler',
    'beds.plantings_logged': 'semis enregistrés',
    'beds.empty': 'Aucun semis enregistré dans ce bac.',
    'beds.empty_cta': 'Allez dans "Cette Semaine" et cliquez sur "Ajouter au Carré" !',
    'beds.guide': 'Guide',
    'beds.sown': 'Semé le :',
    'beds.method': 'Méthode :',
    'beds.harvest_btn': 'Récolter ✓',
    'beds.ready': 'Prêt à récolter !',
    'beds.days_left': 'jours restants',
    'beds.harvested_history': 'Récoltes Effectuées',
    'beds.restore': 'Rétablir en culture',

    // Language & Theme
    'theme.appearance': 'Apparence',
    'theme.light': 'Mode Clair',
    'theme.dark': 'Mode Sombre',
    'theme.auto': 'Automatique (Système)',
    'lang.language': 'Langue',

    // Companion Planting
    'companion.guide_title': 'Guide de Compagnonnage Végétal',
    'companion.all_neighbors': 'Tous les Voisins',
    'companion.friendly_allies': 'Alliés Bénéfiques',
    'companion.unfriendly_foes': 'Incompatibles / À Éviter',
    'companion.bed_alerts': 'Dans Vos Parcelles',
    'companion.how_it_works': 'Comment Fonctionne le Compagnonnage',
    'companion.hide_principles': 'Masquer les Principes',

    // Weather Forecast & Frost Risks
    'weather.forecast_title': 'Météo et Risques de Gel',
    'weather.live_radar': 'Radar Open-Meteo en Direct',
    'weather.current_conditions': 'Conditions Actuelles',
    'weather.frost_risk_7d': 'Risque de Gel sur 7 Jours',
    'weather.no_frost_7d': 'Aucun gel prévu au cours des 7 prochains jours',
    'weather.hard_freeze_alert': 'Alerte Gel Sévère (≤ -2.2°C)',
    'weather.frost_warning_alert': 'Alerte Gel (-1.7 à 0°C)',
    'weather.ground_frost_watch': 'Vigilance Gelée Blanche (0.5 à 2.2°C)',
    'weather.heat_alert': 'Alerte Canicule (≥ 33°C)',
    'weather.wind_alert': 'Alerte Vent Fort et Tempête',
    'weather.view_7day': 'Météo sur 7 Jours et Risques',
    'weather.hide_7day': 'Masquer la Météo',
    'weather.refresh': 'Actualiser',
    'weather.precip': 'Précipitations',
    'weather.wind': 'Vent et Rafales',
    'weather.action_tips': 'Conseils de Protection du Potager',
    'weather.scenarios': 'Tester des Scénarios Météo',
  },

  de: {
    // Navigation
    'nav.this_week': 'Diese Woche',
    'nav.calendar': 'Kalender',
    'nav.beds': 'Meine Beete',
    'nav.chat': 'Gartenberater',
    'nav.maps': 'Gärtnereien (Maps)',
    'nav.search': 'Frost-Warnungen',
    'nav.guide': 'Frost-Ratgeber',
    'nav.voice_call': 'Sprachanruf',

    // Banner & General
    'banner.last_spring_frost': 'Letzter Frühlingsfrost',
    'banner.first_fall_frost': 'Erster Herbstfrost',
    'banner.frost_free_window': 'Frostfreie Periode',
    'banner.change_dates': 'Frostdaten ändern',
    'banner.imminent_frost': 'Erster Frost wird erwartet in ca.',
    'banner.imminent_frost_desc': 'Tagen. Ernten Sie reife Tomaten und Paprika und bereiten Sie Vliese vor.',
    'banner.viewing_week': 'Woche',
    'banner.reset_today': 'Aktuelle Woche',
    'banner.days': 'Tage',

    // This Week View
    'schedule.title': 'Was diese Woche pflanzen',
    'schedule.title_custom': 'Pflanzplan für Woche',
    'schedule.subtitle': 'Empfohlenes Pflanzzeitfenster für',
    'schedule.print': 'Checkliste drucken',
    'schedule.search_placeholder': 'Nach Pflanze filtern (z.B. Knoblauch, Spinat, Tomate)...',
    'schedule.tolerance': 'Frosthärte:',
    'schedule.all_tolerances': 'Alle Härteklassen',
    'schedule.hardy': 'Winterhart',
    'schedule.semi_hardy': 'Mäßig frosthart',
    'schedule.tender': 'Frostempfindlich',
    'schedule.category': 'Kategorie:',
    'schedule.all_crops': 'Alle Pflanzen',
    'schedule.imminent_watch': 'Frostwarnung: Schützen oder Ernten',
    'schedule.overwinter': 'Überwinterung & Frühjahrsernte',
    'schedule.overwinter_desc': 'Im Herbst gepflanzte Kulturen, die vor dem Frost wurzeln und im Frühjahr früh reifen.',
    'schedule.direct_sow': 'Direktsaat ins Freiland',
    'schedule.direct_sow_desc': 'Samen direkt in vorbereitete Gartenbeete oder Töpfe säen.',
    'schedule.indoor_start': 'Vorkultur im Haus',
    'schedule.indoor_start_desc': 'Wärmebedürftige Sorten auf der Fensterbank oder unter Kunstlicht vorziehen.',
    'schedule.transplant': 'Auspflanzen ins Freiland',
    'schedule.transplant_desc': 'Abgehärtete Jungpflanzen ins Gartenbeet setzen.',
    'schedule.no_plants': 'Keine Pflanzen für Woche mit diesem Filter',
    'schedule.view_all': 'Filter zurücksetzen',

    // Plant Card
    'card.window': 'Zeitfenster',
    'card.soil_temp_min': 'Bodentemp. Min:',
    'card.spacing': 'Abstand:',
    'card.depth': 'Sätiefe:',
    'card.days_to_harvest': 'Tage bis Ernte',
    'card.add_to_beds': 'Ins Beet pflanzen',
    'card.details': 'Details',

    // My Beds
    'beds.header': 'Aktive Beete & Protokoll',
    'beds.title': 'Meine Gartenbeete & Pflanzungen',
    'beds.subtitle': 'Erfasste Kulturen, voraussichtliche Erntetermine und Fruchtfolge verwalten.',
    'beds.new_bed': 'Neues Beet',
    'beds.create_title': 'Neues Beet oder Gefäß anlegen',
    'beds.bed_name': 'Beetname / Standort',
    'beds.bed_type': 'Beet-Typ',
    'beds.save_bed': 'Beet speichern',
    'beds.cancel': 'Abbrechen',
    'beds.plantings_logged': 'Pflanzungen erfasst',
    'beds.empty': 'In diesem Beet sind noch keine Pflanzen eingetragen.',
    'beds.empty_cta': 'Gehen Sie auf "Diese Woche" und wählen Sie "Ins Beet pflanzen"!',
    'beds.guide': 'Profil',
    'beds.sown': 'Gesät:',
    'beds.method': 'Methode:',
    'beds.harvest_btn': 'Ernten ✓',
    'beds.ready': 'Erntereif!',
    'beds.days_left': 'Tage verbleibend',
    'beds.harvested_history': 'Geerntet & Abgeschlossen',
    'beds.restore': 'Reaktivieren',

    // Language & Theme
    'theme.appearance': 'Erscheinungsbild',
    'theme.light': 'Heller Modus',
    'theme.dark': 'Dunkler Modus',
    'theme.auto': 'Automatisch (System)',
    'lang.language': 'Sprache',

    // Companion Planting
    'companion.guide_title': 'Mischkultur & Pflanznachbarn',
    'companion.all_neighbors': 'Alle Nachbarn',
    'companion.friendly_allies': 'Gute Nachbarn',
    'companion.unfriendly_foes': 'Schlechte Nachbarn / Vermeiden',
    'companion.bed_alerts': 'In Ihren Beeten',
    'companion.how_it_works': 'Wie Mischkultur Funktioniert',
    'companion.hide_principles': 'Prinzipien Ausblenden',

    // Weather Forecast & Frost Risks
    'weather.forecast_title': 'Wetter- & Frostrisiko-Vorhersage',
    'weather.live_radar': 'Live Open-Meteo Radar',
    'weather.current_conditions': 'Aktuelle Bedingungen',
    'weather.frost_risk_7d': '7-Tage-Frostrisiko',
    'weather.no_frost_7d': 'Kein Frost in den nächsten 7 Tagen erwartet',
    'weather.hard_freeze_alert': 'Dauerfrost-Warnung (≤ -2.2°C)',
    'weather.frost_warning_alert': 'Frost-Warnung (-1.7 bis 0°C)',
    'weather.ground_frost_watch': 'Bodenfrost-Warnung (0.5 bis 2.2°C)',
    'weather.heat_alert': 'Hitze-Warnung (≥ 33°C)',
    'weather.wind_alert': 'Sturm- und Windwarnung',
    'weather.view_7day': '7-Tage-Wetter & Gartenrisiken',
    'weather.hide_7day': 'Wetter ausblenden',
    'weather.refresh': 'Aktualisieren',
    'weather.precip': 'Niederschlag',
    'weather.wind': 'Wind & Böen',
    'weather.action_tips': 'Gartenschutz-Maßnahmen',
    'weather.scenarios': 'Wetterszenarien Testen',
  },

  it: {
    // Navigation
    'nav.this_week': 'Questa Settimana',
    'nav.calendar': 'Calendario',
    'nav.beds': 'I Miei Cassoni',
    'nav.chat': 'Consulente IA',
    'nav.maps': 'Vivai (Maps)',
    'nav.search': 'Allerte Gelo',
    'nav.guide': 'Guida al Gelo',
    'nav.voice_call': 'Chiamata Vocale',

    // Banner & General
    'banner.last_spring_frost': 'Ultima Gelata Primaverile',
    'banner.first_fall_frost': 'Prima Gelata Autunnale',
    'banner.frost_free_window': 'Periodo Senza Gelo',
    'banner.change_dates': 'Modifica Date Gelo',
    'banner.imminent_frost': 'Prima gelata prevista tra circa',
    'banner.imminent_frost_desc': 'giorni. Raccogli pomodori e peperoni e prepara teli protettivi.',
    'banner.viewing_week': 'Settimana',
    'banner.reset_today': 'Settimana Corrente',
    'banner.days': 'giorni',

    // This Week View
    'schedule.title': 'Cosa Piantare Questa Settimana',
    'schedule.title_custom': 'Calendario di Semina per la Settimana',
    'schedule.subtitle': 'Finestra di semina raccomandata per',
    'schedule.print': 'Stampa Lista',
    'schedule.search_placeholder': 'Cerca per pianta (es. Aglio, Spinaci, Pomodoro)...',
    'schedule.tolerance': 'Resistenza al Gelo:',
    'schedule.all_tolerances': 'Tutte le Resistenze',
    'schedule.hardy': 'Molto Resistente',
    'schedule.semi_hardy': 'Semi-Resistente',
    'schedule.tender': 'Sensibile al Gelo',
    'schedule.category': 'Categoria:',
    'schedule.all_crops': 'Tutti i Coltivi',
    'schedule.imminent_watch': 'Allerta Gelo Imminente: Proteggi o Raccogli',
    'schedule.overwinter': 'Semina Invernale & Raccolta Primaverile',
    'schedule.overwinter_desc': 'Colture autunnali che radicano prima del gelo per produrre presto in primavera.',
    'schedule.direct_sow': 'Semina Diretta all’Aperto',
    'schedule.direct_sow_desc': 'Semina direttamente nelle aiuole preparate o nei vasi.',
    'schedule.indoor_start': 'Semina al Chiuso sotto Luci',
    'schedule.indoor_start_desc': 'Colture estive avviate in semenzaio prima dell’ultima gelata.',
    'schedule.transplant': 'Trapianto all’Aperto',
    'schedule.transplant_desc': 'Piantine acclimatate pronte per il trapianto nell’orto.',
    'schedule.no_plants': 'Nessuna pianta programmata per la Settimana',
    'schedule.view_all': 'Reimposta Filtri',

    // Plant Card
    'card.window': 'Finestra',
    'card.soil_temp_min': 'Temp. Suolo Min:',
    'card.spacing': 'Distanza:',
    'card.depth': 'Profondità:',
    'card.days_to_harvest': 'giorni al raccolto',
    'card.add_to_beds': 'Aggiungi all’Orto',
    'card.details': 'Dettagli',

    // My Beds
    'beds.header': 'Aiuole Attive & Registro',
    'beds.title': 'I Miei Bancali & Colture',
    'beds.subtitle': 'Traccia le semine, controlla le stime di raccolta e organizza le rotazioni.',
    'beds.new_bed': 'Nuova Aiuola',
    'beds.create_title': 'Crea Nuova Aiuola o Contenitore',
    'beds.bed_name': 'Nome Aiuola / Posizione',
    'beds.bed_type': 'Tipo di Aiuola',
    'beds.save_bed': 'Salva Aiuola',
    'beds.cancel': 'Annulla',
    'beds.plantings_logged': 'colture registrate',
    'beds.empty': 'Questa aiuola non ha ancora coltivazioni registrate.',
    'beds.empty_cta': 'Vai a "Questa Settimana" e clicca "Aggiungi all’Orto"!',
    'beds.guide': 'Guida',
    'beds.sown': 'Seminato:',
    'beds.method': 'Metodo:',
    'beds.harvest_btn': 'Raccolto ✓',
    'beds.ready': 'Pronto per il raccolto!',
    'beds.days_left': 'giorni rimanenti',
    'beds.harvested_history': 'Raccolti Completati',
    'beds.restore': 'Ripristina',

    // Language & Theme
    'theme.appearance': 'Aspetto',
    'theme.light': 'Tema Chiaro',
    'theme.dark': 'Tema Scuro',
    'theme.auto': 'Automatico (Sistema)',
    'lang.language': 'Lingua',

    // Companion Planting
    'companion.guide_title': 'Guida alle Consociazioni',
    'companion.all_neighbors': 'Tutti i Vicini',
    'companion.friendly_allies': 'Alleati Benefici',
    'companion.unfriendly_foes': 'Incompatibili / Da Evitare',
    'companion.bed_alerts': 'Nelle Tue Aiuole',
    'companion.how_it_works': 'Come Funziona la Consociazione',
    'companion.hide_principles': 'Nascondi Principi',

    // Weather Forecast & Frost Risks
    'weather.forecast_title': 'Meteo e Rischio Gelate',
    'weather.live_radar': 'Radar Open-Meteo in Tempo Reale',
    'weather.current_conditions': 'Condizioni Attuali',
    'weather.frost_risk_7d': 'Rischio Gelate a 7 Giorni',
    'weather.no_frost_7d': 'Nessuna gelata prevista nei prossimi 7 giorni',
    'weather.hard_freeze_alert': 'Allerta Gelo Intenso (≤ -2.2°C)',
    'weather.frost_warning_alert': 'Allerta Gelata (-1.7 a 0°C)',
    'weather.ground_frost_watch': 'Avviso Brina al Suolo (0.5 a 2.2°C)',
    'weather.heat_alert': 'Allerta Caldo Estremo (≥ 33°C)',
    'weather.wind_alert': 'Allerta Vento Forte e Tempesta',
    'weather.view_7day': 'Meteo a 7 Giorni e Rischi',
    'weather.hide_7day': 'Nascondi Previsioni',
    'weather.refresh': 'Aggiorna',
    'weather.precip': 'Precipitazioni',
    'weather.wind': 'Vento e Raffiche',
    'weather.action_tips': 'Consigli per Proteggere l’Orto',
    'weather.scenarios': 'Testa Scenari Meteo',
  },

  pt: {
    // Navigation
    'nav.this_week': 'Esta Semana',
    'nav.calendar': 'Calendário',
    'nav.beds': 'Meus Canteiros',
    'nav.chat': 'Consultor IA',
    'nav.maps': 'Hortos (Maps)',
    'nav.search': 'Alertas de Geada',
    'nav.guide': 'Guia de Geadas',
    'nav.voice_call': 'Chamada de Voz',

    // Banner & General
    'banner.last_spring_frost': 'Última Geada da Primavera',
    'banner.first_fall_frost': 'Primeira Geada do Outono',
    'banner.frost_free_window': 'Período Livre de Geadas',
    'banner.change_dates': 'Alterar Datas de Geada',
    'banner.imminent_frost': 'Primeira geada prevista em cerca de',
    'banner.imminent_frost_desc': 'dias. Colha tomates e pimentões maduros e prepare coberturas protetoras.',
    'banner.viewing_week': 'Semana',
    'banner.reset_today': 'Semana Atual',
    'banner.days': 'dias',

    // This Week View
    'schedule.title': 'O Que Plantar Esta Semana',
    'schedule.title_custom': 'Calendário de Plantio para a Semana',
    'schedule.subtitle': 'Janela de plantio recomendada para',
    'schedule.print': 'Imprimir Lista',
    'schedule.search_placeholder': 'Filtrar por cultura (ex.: Alho, Espinafre, Tomate)...',
    'schedule.tolerance': 'Tolerância a Geadas:',
    'schedule.all_tolerances': 'Todas as Tolerâncias',
    'schedule.hardy': 'Resistente a Geadas',
    'schedule.semi_hardy': 'Semi-Resistente',
    'schedule.tender': 'Sensível a Geadas',
    'schedule.category': 'Categoria:',
    'schedule.all_crops': 'Todas as Culturas',
    'schedule.imminent_watch': 'Alerta de Geada Iminente: Proteger ou Colher',
    'schedule.overwinter': 'Plantio de Outono para Colheita na Primavera',
    'schedule.overwinter_desc': 'Culturas plantadas no outono que enraízam antes do congelamento e rendem na primavera.',
    'schedule.direct_sow': 'Semeadura Direta nos Canteiros',
    'schedule.direct_sow_desc': 'Plante sementes diretamente no solo preparado ou em vasos.',
    'schedule.indoor_start': 'Sementeira Protegida no Interior',
    'schedule.indoor_start_desc': 'Culturas sensíveis iniciadas em bandejas antes da última geada.',
    'schedule.transplant': 'Transplante para o Exterior',
    'schedule.transplant_desc': 'Mudas aclimatadas prontas para transferência para a horta.',
    'schedule.no_plants': 'Nenhuma cultura programada para a Semana',
    'schedule.view_all': 'Redefinir Filtros',

    // Plant Card
    'card.window': 'Janela',
    'card.soil_temp_min': 'Temp. Solo Mín:',
    'card.spacing': 'Espaçamento:',
    'card.depth': 'Profundidade:',
    'card.days_to_harvest': 'dias até a colheita',
    'card.add_to_beds': 'Adicionar ao Canteiro',
    'card.details': 'Detalhes',

    // My Beds
    'beds.header': 'Canteiros Ativos & Registro',
    'beds.title': 'Meus Canteiros e Culturas',
    'beds.subtitle': 'Acompanhe plantios, datas estimadas de colheita e organize suas rotações.',
    'beds.new_bed': 'Novo Canteiro',
    'beds.create_title': 'Criar Novo Canteiro ou Vaso',
    'beds.bed_name': 'Nome do Canteiro / Localização',
    'beds.bed_type': 'Tipo de Canteiro',
    'beds.save_bed': 'Salvar Canteiro',
    'beds.cancel': 'Cancelar',
    'beds.plantings_logged': 'culturas registradas',
    'beds.empty': 'Este canteiro ainda não tem culturas registradas.',
    'beds.empty_cta': 'Vá até "Esta Semana" e clique em "Adicionar ao Canteiro"!',
    'beds.guide': 'Guia',
    'beds.sown': 'Plantado:',
    'beds.method': 'Método:',
    'beds.harvest_btn': 'Colher ✓',
    'beds.ready': 'Pronto para colheita!',
    'beds.days_left': 'dias restantes',
    'beds.harvested_history': 'Colheitas Concluídas',
    'beds.restore': 'Reativar',

    // Language & Theme
    'theme.appearance': 'Aparência',
    'theme.light': 'Modo Claro',
    'theme.dark': 'Modo Escuro',
    'theme.auto': 'Automático (Sistema)',
    'lang.language': 'Idioma',

    // Companion Planting
    'companion.guide_title': 'Guia de Plantas Companheiras',
    'companion.all_neighbors': 'Todos os Vizinhos',
    'companion.friendly_allies': 'Aliados Benéficos',
    'companion.unfriendly_foes': 'Incompatíveis / Evitar',
    'companion.bed_alerts': 'Nos Seus Canteiros',
    'companion.how_it_works': 'Como Funciona o Consórcio',
    'companion.hide_principles': 'Ocultar Princípios',

    // Weather Forecast & Frost Risks
    'weather.forecast_title': 'Previsão do Tempo e Riscos de Geada',
    'weather.live_radar': 'Radar Open-Meteo em Tempo Real',
    'weather.current_conditions': 'Condições Atuais',
    'weather.frost_risk_7d': 'Risco de Geada para 7 Dias',
    'weather.no_frost_7d': 'Sem previsão de geada para os próximos 7 dias',
    'weather.hard_freeze_alert': 'Alerta de Geada Forte (≤ -2.2°C)',
    'weather.frost_warning_alert': 'Alerta de Geada (-1.7 a 0°C)',
    'weather.ground_frost_watch': 'Aviso de Geada Superficial (0.5 a 2.2°C)',
    'weather.heat_alert': 'Alerta de Calor Extremo (≥ 33°C)',
    'weather.wind_alert': 'Alerta de Ventos Fortes e Tempestade',
    'weather.view_7day': 'Previsão de 7 Dias e Riscos',
    'weather.hide_7day': 'Ocultar Previsão',
    'weather.refresh': 'Atualizar',
    'weather.precip': 'Precipitação',
    'weather.wind': 'Vento e Rajadas',
    'weather.action_tips': 'Conselhos de Proteção para a Horta',
    'weather.scenarios': 'Testar Cenários Meteorológicos',
  },

  ja: {
    // Navigation
    'nav.this_week': '今週の植え付け',
    'nav.calendar': 'カレンダー',
    'nav.beds': '菜園ベッド',
    'nav.chat': '園芸AI相談',
    'nav.maps': '園芸店・種苗店 (Maps)',
    'nav.search': '霜・気象アラート',
    'nav.guide': '霜対策ガイド',
    'nav.voice_call': '音声通話',

    // Banner & General
    'banner.last_spring_frost': '春の晩霜日',
    'banner.first_fall_frost': '秋の初霜日',
    'banner.frost_free_window': '無霜期間',
    'banner.change_dates': '霜の時期を変更',
    'banner.imminent_frost': '初霜まで約',
    'banner.imminent_frost_desc': '日です。熟したトマトやピーマンを収穫し、不織布などの霜よけを準備してください。',
    'banner.viewing_week': '第',
    'banner.reset_today': '今週に戻る',
    'banner.days': '日間',

    // This Week View
    'schedule.title': '今週植えるべき野菜・作物',
    'schedule.title_custom': '第',
    'schedule.subtitle': '地域の霜日に基づく推奨植え付け期間：',
    'schedule.print': 'リストを印刷',
    'schedule.search_placeholder': '作物名で検索（例：ニンニク、ホウレンソウ、トマト）...',
    'schedule.tolerance': '耐寒性：',
    'schedule.all_tolerances': 'すべての耐寒性',
    'schedule.hardy': '極耐寒性',
    'schedule.semi_hardy': '中耐寒性',
    'schedule.tender': '霜に弱い（暖地性）',
    'schedule.category': '品目：',
    'schedule.all_crops': '全作物',
    'schedule.imminent_watch': '霜注意報：防寒または緊急収穫',
    'schedule.overwinter': '越冬栽培・秋植え球根',
    'schedule.overwinter_desc': '秋に根を張らせ、冬を越して翌春早くに収穫する作物です。',
    'schedule.direct_sow': '畑・プランターへの直まき',
    'schedule.direct_sow_desc': '準備した畝やプランターに種を直接まきます。',
    'schedule.indoor_start': '室内・温床での育苗開始',
    'schedule.indoor_start_desc': '晩霜前にセルトレイやポットで育てる夏野菜など。',
    'schedule.transplant': '屋外への定植（苗植え）',
    'schedule.transplant_desc': '順化（ハードニング）した苗を畑やプランターに定植します。',
    'schedule.no_plants': '該当する作物は今週はありません',
    'schedule.view_all': '条件をリセット',

    // Plant Card
    'card.window': '好適時期',
    'card.soil_temp_min': '最低地温:',
    'card.spacing': '株間:',
    'card.depth': '深さ:',
    'card.days_to_harvest': '日（収穫まで）',
    'card.add_to_beds': '菜園に記録',
    'card.details': '詳細',

    // My Beds
    'beds.header': '菜園管理＆栽培ログ',
    'beds.title': 'マイスペース＆菜園ベッド',
    'beds.subtitle': '種まき日や予想収穫日を記録し、季節ごとの輪作を計画しましょう。',
    'beds.new_bed': '新しい畝・プランター',
    'beds.create_title': '新しい菜園ベッド・プランターの作成',
    'beds.bed_name': '名称 / 場所',
    'beds.bed_type': 'タイプ',
    'beds.save_bed': '保存',
    'beds.cancel': 'キャンセル',
    'beds.plantings_logged': '件の栽培記録',
    'beds.empty': 'まだ作物が記録されていません。',
    'beds.empty_cta': '「今週の植え付け」から「菜園に記録」をクリックして追加してください！',
    'beds.guide': '詳細図鑑',
    'beds.sown': '播種・定植:',
    'beds.method': '栽培方法:',
    'beds.harvest_btn': '収穫済にする ✓',
    'beds.ready': '収穫適期です！',
    'beds.days_left': '日後',
    'beds.harvested_history': '収穫完了ログ',
    'beds.restore': '栽培中に戻す',

    // Language & Theme
    'theme.appearance': '外観モード',
    'theme.light': 'ライトモード',
    'theme.dark': 'ダークモード',
    'theme.auto': '自動（端末連動）',
    'lang.language': '言語',

    // Companion Planting
    'companion.guide_title': 'コンパニオンプランツ（共栄作物）ガイド',
    'companion.all_neighbors': 'すべての隣接作物',
    'companion.friendly_allies': '相性の良い仲間（味方）',
    'companion.unfriendly_foes': '相性の悪い作物（混植回避）',
    'companion.bed_alerts': '作成した畝のアラート',
    'companion.how_it_works': 'コンパニオンプランツの仕組み',
    'companion.hide_principles': '原理を閉じる',

    // Weather Forecast & Frost Risks
    'weather.forecast_title': '気象予報・霜害リスク予報',
    'weather.live_radar': 'Open-Meteo ライブ気象レーダー',
    'weather.current_conditions': '現在の気象',
    'weather.frost_risk_7d': '今後7日間の霜リスク',
    'weather.no_frost_7d': '今後7日間に霜の発生予測はありません',
    'weather.hard_freeze_alert': '厳しい凍結警報 (≤ -2.2°C)',
    'weather.frost_warning_alert': '霜・氷点下注意報 (-1.7〜0°C)',
    'weather.ground_frost_watch': '地表霜・放射冷却注意 (0.5〜2.2°C)',
    'weather.heat_alert': '猛暑・高温障害警報 (≥ 33°C)',
    'weather.wind_alert': '強風・暴風雨警報',
    'weather.view_7day': '7日間天気予報と菜園リスク',
    'weather.hide_7day': '予報を閉じる',
    'weather.refresh': '予報を更新',
    'weather.precip': '降水量',
    'weather.wind': '風速・最大瞬間風速',
    'weather.action_tips': '菜園の防護対策',
    'weather.scenarios': '気象シミュレーションを試す',
  }
};

interface LanguageContextType {
  language: LanguageCode;
  setLanguage: (lang: LanguageCode) => void;
  t: (key: string, fallback?: string) => string;
  currentOption: LanguageOption;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const STORAGE_LANG_KEY = 'frostsow_language_code_v1';

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<LanguageCode>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_LANG_KEY) as LanguageCode | null;
      if (saved && SUPPORTED_LANGUAGES.some((l) => l.code === saved)) {
        return saved;
      }
      // Check browser language
      const browserLang = navigator.language?.slice(0, 2).toLowerCase();
      if (browserLang && SUPPORTED_LANGUAGES.some((l) => l.code === browserLang)) {
        return browserLang as LanguageCode;
      }
    } catch {
      // ignore
    }
    return 'en';
  });

  const setLanguage = (newLang: LanguageCode) => {
    setLanguageState(newLang);
    try {
      localStorage.setItem(STORAGE_LANG_KEY, newLang);
      document.documentElement.lang = newLang;
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  const currentOption = SUPPORTED_LANGUAGES.find((l) => l.code === language) || SUPPORTED_LANGUAGES[0];

  const t = (key: string, fallback?: string): string => {
    const langDict = TRANSLATIONS[language] || TRANSLATIONS.en;
    if (langDict[key]) return langDict[key];
    if (TRANSLATIONS.en[key]) return TRANSLATIONS.en[key];
    return fallback || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, currentOption }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
