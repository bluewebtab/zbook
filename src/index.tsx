import * as esbuild from 'esbuild-wasm';
import {useState, useEffect, useRef} from 'react';
import ReactDOM from 'react-dom';
import {unpkgPathPlugin} from './plugins/unpkg-path-plugin';
import {fetchPlugin} from './plugins/fetch-plugin';

const App = () => {
    const ref = useRef<any>();
    const [input, setInput] = useState('');
    const [code, setCode] = useState('');

    const startService = async () => {
        //we can reference ref.current anywhere inside the component
        ref.current = await esbuild.startService({
            //this allows you to use esbuild service
            worker: true,
            wasmURL: '/esbuild.wasm'

        })
    }
    useEffect(() => {
        startService();
    //[] means we are going to run this once
    }, [])

    const onClick = async () => {
        //if there is no ref.current then it returns early
        if(!ref.current){
            return;
        }


        const result = await ref.current.build({
            entryPoints: ['index.js'],
            bundle: true,
            write: false,
            plugins: [
                unpkgPathPlugin(),
                fetchPlugin(input)
            ],
            define: {
                'process.env.NODE_ENV': '"production"',
                global: 'window',

            }
        });
        setCode(result.outputFiles[0].text)
    }
    return <div>
        <textarea value={input} onChange={e => setInput(e.target.value)}></textarea>
        <div>
            <button onClick={onClick}>Submit</button>
        </div>
        <pre>{code}</pre>
    </div>
}

ReactDOM.render(<App />, document.querySelector('#root'))