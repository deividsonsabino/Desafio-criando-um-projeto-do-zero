import React, { useRef } from "react";

import { useScript } from "../../lib/use-script"

export function Comments() {
    const comment = useRef(null);

    const status = useScript({
        url: "https://utteranc.es/client.js",
        theme: "github-dark",
        issueTerm: "pathname",
        label: "Comentários",
        repo: "deividsonsabino/Desafio-criando-um-projeto-do-zero",
        ref: comment
    });

    return (
        <div className="w-full">
            {
                <div ref={comment}></div>
            }
        </div>
    );

}
