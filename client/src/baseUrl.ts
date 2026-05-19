const isProduction = import.meta.env.PROD;

const prod = "https://smartlockbackend.fly.dev"
const dev = "http://localhost:5005"

export const finalUrl = isProduction ? prod : dev