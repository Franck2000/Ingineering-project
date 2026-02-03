// Formater les bytes en unité lisible
export const formatBytes = (bytes) => {
  if (!bytes) return 'N/A';
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${sizes[i]}`;
};

// Formater une date
export const formatDate = (date) => {
  if (!date) return 'N/A';
  return new Date(date).toLocaleString('fr-FR');
};

// Calculer les stats de vulnérabilités par sévérité
export const countBySeverity = (vulnerabilities) => 
  vulnerabilities.reduce((acc, v) => {
    acc[v.severity] = (acc[v.severity] || 0) + 1;
    return acc;
  }, {});

// Obtenir la couleur de la barre de progression selon le pourcentage
export const getProgressColor = (percent) => {
  if (percent > 80) return 'red';
  if (percent > 60) return 'yellow';
  return 'green';
};
