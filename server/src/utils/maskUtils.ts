/**
 * 手机号码掩码处理
 * 将手机号中间4位替换为****
 * 例如: 13812345678 -> 138****5678
 * @param mobile 原始手机号
 * @returns 掩码后的手机号，如果输入为空则返回null
 */
export const maskMobile = (mobile?: string | null): string | null => {
  if (!mobile) return null;
  return mobile.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2');
};

/**
 * 邮箱掩码处理
 * 将邮箱用户名部分中间替换为***
 * 例如: test@example.com -> t***@example.com
 * @param email 原始邮箱
 * @returns 掩码后的邮箱，如果输入为空则返回null
 */
export const maskEmail = (email?: string | null): string | null => {
  if (!email) return null;
  return email.replace(/(.).+(@.+)/, '$1***$2');
};