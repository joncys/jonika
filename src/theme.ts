const cRaisinBlack = '#221E22'
const cDarkPurple = '#31263E'
const cEnglishViolet = '#44355B'
const cMarigold = '#ECA72C'
const cFlame = '#EE5622'
const cGainsboro = '#E0E1E9'

export const theme = {
  colors: {
    backgroundPrimary: cRaisinBlack,
    backgroundSecondary: cDarkPurple,
    primary: cFlame,
    secondary: cMarigold,
    tertiary: cEnglishViolet,

    textTertiary: cGainsboro
  }
}

export type Theme = typeof theme
