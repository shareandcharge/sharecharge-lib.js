export function range(max: number) {
    function* ranger() {
        let index = 0;
        while (index < max) {
            yield index++;
        }
    }
    return Array.from(ranger());
}
