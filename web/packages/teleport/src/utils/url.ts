

export default function converToUrl(
  params?: {
    [x: string]: any;
  }
) {
  let requestParams:string[] = []

  Object.entries(params).forEach(([key, value]) => {
    let param = key + '=' + value;
    requestParams.push(param);
  });
  return '?' + requestParams.join('&');


}
