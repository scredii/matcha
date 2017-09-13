SELECT U.*, L.city, L.latitude, L.longitude, P.picture, H.hashtag, block.* FROM users U INNER JOIN locations L ON U.id = L.id_content LEFT JOIN pictures P ON U.id = P.content_id AND P.pp = 1 LEFT JOIN hashtag H ON U.id = H.content_id left JOIN block ON  U.id = block.by_id ORDER BY U.id