const GH_PATTERN = /\/([\w-]+)\/([\w-]+)\/?$/;
const GB_PATTERN = /\/([\w]+)\/(\d+)\/?$/;

async function getGitHubDownloads() {
    if (!GITHUB_URL) return 0;
    const ghDetails = GITHUB_URL.match(GH_PATTERN);
    if(!ghDetails) throw new Error("Invalid GitHub url. No match for pattern: " + GH_PATTERN);

    const res = await(
        await fetch(
            "https://api.github.com/repos/" + ghDetails[1] + "/" + ghDetails[2] + "/releases",
            {headers: {"User-Agent": "crusademods"}}
        )
    ).json();

    console.log(res);
    if (res.status && res.status != "200") throw new Error("Bad status code: " + res.status);

    return res.reduce(
        ((sum, release) => sum + release.assets.reduce(
            ((sum, asset) => sum + asset.download_count), 0
        )), 0
    );
}

async function getGameBananaDownloads() {
    if (!GAMEBANANA_URL) return 0;
    const gbDetails = GAMEBANANA_URL.match(GB_PATTERN);
    if(!gbDetails) throw new Error("Invalid GameBanana url. No match for pattern: " + GB_PATTERN);
    
    const res = await(
        await fetch(
            "https://gamebanana.com/apiv7/" + gbCategoryTransform(gbDetails[1]) + "/" +
                gbDetails[2] + "?_csvProperties=_aFiles"
        )
    ).json().catch(error => {
        throw new Error("Failed to parse response: " + error);
    });

    console.log(res);
    if (!res._aFiles)
        throw new Error("Bad api response: " + res);

    return res._aFiles.reduce(
        ((sum, file) => sum + file._nDownloadCount), 0
    );
}

function gbCategoryTransform(str) {
    return str.charAt(0).toUpperCase() + str.slice(1, -1);
}

async function getDownloads() {
    let before = Date.now();
    // const downloads = await getGitHubDownloads();
    const ghDownloads = getGitHubDownloads();
    const gbDownloads = getGameBananaDownloads();
    let downloads = 0;
    (await Promise.allSettled([ghDownloads, gbDownloads])).forEach((promise) => {
        if (promise.status === "fulfilled") {
            downloads += promise.value;
        }
    });
    document.getElementById("stat-downloads").innerHTML = downloads;
    console.log("Execution time: " + (Date.now() - before + "ms"));
}

async function getGitHubStars() {
    if (!GITHUB_URL) return 0;
    const ghDetails = GITHUB_URL.match(GH_PATTERN);
    if(!ghDetails) throw new Error("Invalid GitHub url. No match for pattern: " + GH_PATTERN);

    const res = await(
        await fetch(
            "https://api.github.com/repos/" + ghDetails[1] + "/" + ghDetails[2],
            {headers: {"User-Agent": "crusademods"}}
        )
    ).json();

    console.log(res);
    if (res.status && res.status != "200")
        throw new Error("Bad status code: " + res.status);

    return res.stargazers_count;
}

async function getStars() {
    let before = Date.now();
    const stars = await getGitHubStars();
    document.getElementById("stat-stars").innerHTML = stars;
    console.log("Execution time: " + (Date.now() - before + "ms"));
}

getDownloads();
getStars();