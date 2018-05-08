import {Component} from 'react';

class CatchErrors extends Component {
    componentDidCatch(error, info)
    {
        window.localStorage.setItem('data', null);
        throw error;
    }

    render() {
        return this.props.children;
    }
}

export default CatchErrors;
