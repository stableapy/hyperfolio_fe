// Types for the swap widget module

export interface TokenInfo {
  address: string
  symbol: string
  chainId: number
}

export interface SwapWidgetBaseProps {
  fromToken?: TokenInfo
  toToken?: TokenInfo
}

export interface SwapWidgetModalProps extends SwapWidgetBaseProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export type SwapWidgetInlineProps = SwapWidgetBaseProps

// KyberSwap theme configuration type
export interface KyberSwapTheme {
  primary: string
  secondary: string
  dialog: string
  borderRadius: string
  buttonRadius: string
  stroke: string
  interactive: string
  accent: string
  success: string
  warning: string
  error: string
  text: string
  subText: string
  fontFamily: string
  boxShadow: string
}

// Fee configuration type
export interface FeeSetting {
  feeAmount: number
  feeReceiver: string
  chargeFeeBy: "currency_in" | "currency_out"
  isInBps: boolean
}

