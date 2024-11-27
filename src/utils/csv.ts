interface CSVField<T> {
  header: string;
  key: keyof T;
  required: boolean;
  validate?: (value: string) => boolean;
  transform?: (value: string) => any;
}

interface ParseResult<T> {
  data: Partial<T>[];
  errors: string[];
}

function parseDate(dateStr: string): string {
  // Vérifie si la date est au format DD/MM/YYYY
  const ddmmyyyyMatch = dateStr.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (ddmmyyyyMatch) {
    const [_, day, month, year] = ddmmyyyyMatch;
    return `${year}-${month}-${day}`; // Convertit en YYYY-MM-DD
  }

  // Vérifie si la date est déjà au format YYYY-MM-DD
  const yyyymmddMatch = dateStr.match(/^\d{4}-\d{2}-\d{2}$/);
  if (yyyymmddMatch) {
    return dateStr;
  }

  throw new Error('Format de date invalide. Utilisez DD/MM/YYYY ou YYYY-MM-DD');
}

export async function parseCSV<T>(
  content: string,
  fields: CSVField<T>[]
): Promise<ParseResult<T>> {
  // Déterminer le séparateur (point-virgule ou virgule)
  const firstLine = content.split('\n')[0];
  const separator = firstLine.includes(';') ? ';' : ',';

  const lines = content.split('\n');
  if (lines.length < 2) {
    return { data: [], errors: ['Le fichier est vide ou ne contient que l\'en-tête'] };
  }

  // Parse headers - on garde les caractères spéciaux mais on normalise la casse
  const headers = lines[0].split(separator).map(h => h.trim().toLowerCase());
  
  // Validate required headers
  const missingHeaders = fields
    .filter(f => f.required)
    .filter(f => !headers.includes(f.header.toLowerCase()))
    .map(f => f.header);

  if (missingHeaders.length > 0) {
    return {
      data: [],
      errors: [`Colonnes obligatoires manquantes : ${missingHeaders.join(', ')}`]
    };
  }

  const result: ParseResult<T> = { data: [], errors: [] };

  // Parse data lines
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    // Gestion des valeurs entre guillemets
    const values: string[] = [];
    let currentValue = '';
    let insideQuotes = false;
    
    for (let j = 0; j < line.length; j++) {
      const char = line[j];
      
      if (char === '"') {
        insideQuotes = !insideQuotes;
      } else if ((char === separator) && !insideQuotes) {
        values.push(currentValue.trim());
        currentValue = '';
      } else {
        currentValue += char;
      }
    }
    values.push(currentValue.trim());

    // Nettoyer les guillemets des valeurs
    const cleanedValues = values.map(v => {
      // Supprimer les guillemets au début et à la fin
      let cleaned = v.replace(/^"(.*)"$/, '$1').trim();
      // Remplacer les doubles guillemets par des simples
      cleaned = cleaned.replace(/""/g, '"');
      return cleaned;
    });

    const row: Partial<T> = {};
    let hasError = false;

    fields.forEach(field => {
      const headerIndex = headers.indexOf(field.header.toLowerCase());
      if (headerIndex === -1) {
        if (field.required) {
          result.errors.push(`Ligne ${i + 1}: Colonne ${field.header} manquante`);
          hasError = true;
        }
        return;
      }

      const value = cleanedValues[headerIndex];

      // Check required
      if (field.required && !value) {
        result.errors.push(`Ligne ${i + 1}: Valeur manquante pour ${field.header}`);
        hasError = true;
        return;
      }

      // Validate value
      if (value && field.validate && !field.validate(value)) {
        result.errors.push(`Ligne ${i + 1}: Valeur invalide pour ${field.header}`);
        hasError = true;
        return;
      }

      // Transform value
      try {
        if (field.key === 'date' as keyof T) {
          row[field.key] = parseDate(value) as any;
        } else {
          row[field.key] = field.transform ? field.transform(value) : value;
        }
      } catch (error: any) {
        result.errors.push(`Ligne ${i + 1}: ${error.message || 'Erreur de conversion'} pour ${field.header}`);
        hasError = true;
      }
    });

    if (!hasError) {
      result.data.push(row);
    }
  }

  return result;
}