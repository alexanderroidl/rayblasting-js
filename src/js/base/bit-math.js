class BitMath {
  static floor(n) {
    return n << 0
  }
  
  static round(n) {
    return (0.5 + n) << 0
  }

  static abs(n) {
    return (n ^ (n >> 31)) - (n >> 31)
  }
}