import { Server } from "socket.io";
import { readFileSync, writeFileSync } from "fs";

const endpoints = {
    counts: {
        default: {},
    },
    tasks: {
        default: [],
    },
    streak: {
        default: 0,
    },
    streakfreezes: {
        default: 0,
    },
    daysuntilfreeze: {
        default: 3,
    },
    notes: {
        default: [],
    },
};
let newestDaychangeover = "";

export function initListeners(server) {
    server.on("connection", (socket) => {
        socket.join("subscribers");

        for (let name in endpoints) {
            const endpoint = endpoints[name];

            socket.on("get-" + name, () => {
                try {
                    endpoint.value = JSON.parse(
                        readFileSync("data/" + name + ".json")
                    );
                } catch (err) {
                    endpoint.value = endpoint.default;
                }
                socket.emit("update-" + name, endpoint.value);
            });

            socket.on("set-" + name, (message) => {
                if (
                    JSON.stringify(message) !== JSON.stringify(endpoint.value)
                ) {
                    endpoint.value = message;
                    socket.to("subscribers").emit("update-" + name, message);
                    writeFileSync(
                        "data/" + name + ".json",
                        JSON.stringify(message)
                    );
                }
            });
        }

        socket.on("do-daychangeover", (message) => {
            if (message.day > newestDaychangeover) {
                newestDaychangeover = message.day;

                for (let name of ['streak', 'streakfreezes', 'daysuntilfreeze', 'counts', 'tasks']) {
                    const endpoint = endpoints[name];
                    endpoint.value = message[name];
                    writeFileSync(
                        "data/" + name + ".json",
                        JSON.stringify(endpoint.value)
                    );
                }
            }

            for (let name of ['streak', 'streakfreezes', 'daysuntilfreeze', 'counts', 'tasks']) {
                const endpoint = endpoints[name];

                try {
                    endpoint.value = JSON.parse(
                        readFileSync("data/" + name + ".json")
                    );
                } catch (err) {
                    endpoint.value = endpoint.default;
                }
                socket.emit("update-" + name, endpoint.value);
            }
        });
    });
}


export function configureServer(viteServer) {
    const server = new Server(viteServer.httpServer);
    initListeners(server);
}
