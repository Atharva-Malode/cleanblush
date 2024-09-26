import { useNavigate } from 'react-router-dom';

function SelectionPage(){
    const navigate = useNavigate();

    return(
        <div className='space-y-6'>
            <h1 className="font-serif text-4xl font-bold text-indigo-600 leading-tight">Selection Page</h1>
            <button onClick={() => navigate('/osmf')} className='mr-2 bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-3 px-6 rounded-full'>OSMF</button>
            <button onClick={() => navigate('/gingivitis')} className='mr-2 bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-3 px-6 rounded-full'>Gingivitis</button>
            <button onClick={() => navigate('/phenotype')} className='mr-2 bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-3 px-6 rounded-full'>Gingival Phenotype</button>
            <button onClick={() => navigate('/calculus')} className='mr-2 bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-3 px-6 rounded-full'>Calculus</button>
        </div>
    )
}

export default SelectionPage;


