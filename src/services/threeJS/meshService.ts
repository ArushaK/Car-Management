import { Mesh, MeshStandardMaterial, Scene } from "three";

export const changeMeshColor = (uuid: string | null, colorHash: string, scene: Scene | null): void => {
    if (!uuid || !scene) return;

    // Find the object by UUID
    const object = scene.getObjectByProperty("uuid", uuid);

    if (object && object instanceof Mesh) {
        // Clone the material to avoid sharing it with other meshes
        if (Array.isArray(object.material)) {
            object.material = object.material.map((m) => {
                if (m instanceof MeshStandardMaterial) {
                    const cloned = m.clone();
                    if(object.name.toLowerCase().includes('leather')) {
                        cloned.emissive.set(colorHash);
                    } else {
                        cloned.color.set(colorHash);
                    }
                    return cloned;
                }
                return m;
            });
        } else if (object.material instanceof MeshStandardMaterial) {
            const cloned = object.material.clone();
            if (object.name.toLowerCase().includes('leather')) {
                cloned.emissive.set(colorHash);
            } else {
                cloned.color.set(colorHash);
            }
            object.material = cloned;
        }
    }
}