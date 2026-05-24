import { highlight } from '$lib/highlight';

const rustSample = `pub fn process_raw(path: &Path) -> Result<RawImage, ProcessError> {
    let processor = LibRaw::new();
    let raw = processor.open(path)?;

    // Copy pixel data into Rust-owned allocation
    let pixels = raw.unpack_to_vec()?;
    let metadata = raw.metadata().clone();

    // Release the C-side resources explicitly
    drop(raw);
    drop(processor);

    Ok(RawImage { pixels, metadata })
}`;

export async function load() {
	const code = await highlight(rustSample, 'rust');
	return { code };
}
