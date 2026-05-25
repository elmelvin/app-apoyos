export const passwordRules = [
  {
    id: "length",
    label: "Minimo 8 caracteres",
    test: (value: string) => value.length >= 8,
  },
  {
    id: "uppercase",
    label: "Al menos una letra mayuscula",
    test: (value: string) => /[A-ZÁÉÍÓÚÑ]/.test(value),
  },
  {
    id: "number",
    label: "Al menos un numero",
    test: (value: string) => /\d/.test(value),
  },
];

export const getPasswordValidationMessage = (password: string) => {
  const invalidRule = passwordRules.find((rule) => !rule.test(password));
  return invalidRule ? `La contrasena debe incluir: ${invalidRule.label.toLowerCase()}.` : "";
};

export const isPasswordValid = (password: string) =>
  passwordRules.every((rule) => rule.test(password));
