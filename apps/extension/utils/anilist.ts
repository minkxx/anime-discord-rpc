export async function fetchAnilistCover(
	anilistId: number,
): Promise<string | null> {
	const query = `
        query ($id: Int) {
            Media (id: $id, type: ANIME) {
                coverImage {
                    medium
                }
            }
        }
    `;

	try {
		const res = await fetch("https://graphql.anilist.co", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Accept: "application/json",
			},
			body: JSON.stringify({
				query,
				variables: { id: anilistId },
			}),
		});

		const json = await res.json();
		return json.data?.Media?.coverImage?.medium || null;
	} catch (error) {
		console.error("AniList API Error:", error);
		return null;
	}
}
