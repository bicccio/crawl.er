export default () => {
  const clean = (url, hostname, protocol) => {
    // remove trailing slash

    let cleanUrl = url.replace(/\/$/, "");

    let completeUrl = "";
    if (cleanUrl.includes("http")) {
      // urls with protocol and all
      completeUrl = cleanUrl;
    } else {
      const doubleSlashLeading = new RegExp("^//");
      if (doubleSlashLeading.test(cleanUrl)) {
        completeUrl = `${protocol}${cleanUrl}`;
      } else {
        const singleSlashLeading = new RegExp("^/");
        cleanUrl = singleSlashLeading.test(cleanUrl) || cleanUrl === "" ? cleanUrl : `/${cleanUrl}`;
        completeUrl = `${protocol}//${hostname}${cleanUrl}`;
      }
    }

    return completeUrl;
  };

  return { clean };
};
