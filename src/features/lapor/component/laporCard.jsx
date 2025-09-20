export default function LaporCard({imageURL, judul, deskripsi, alamat, kategori}){
    return(
        <div>
            <img src={imageURL} alt={`${judul} image`}/>
            <h2>{judul}</h2>
            <p>{deskripsi}</p>
            <p>{alamat}</p>
            <p>{kategori}</p>
        </div>
    )
}