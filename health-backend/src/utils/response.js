// 统一响应格式
export function success(res, data, message = 'Success') {
  res.json({
    success: true,
    data,
    message
  })
}

export function error(res, statusCode, message, code = null) {
  res.status(statusCode).json({
    success: false,
    error: message,
    code
  })
}

export function paginated(res, data, total, page, pageSize) {
  res.json({
    success: true,
    data,
    pagination: {
      total,
      page,
      page_size: pageSize,
      total_pages: Math.ceil(total / pageSize)
    }
  })
}
