export default function setAsyncInterval(fn: () => void, delay: number) {
    let stopped = false;

    (async function loop() {
        while (!stopped) {
            try {
                await fn();
            } catch (err) {
                console.error(err);
            }
            await new Promise((r) => setTimeout(r, delay));
        }
    })();

    return () => (stopped = true);
}
