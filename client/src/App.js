import './App.scss';
import { Switch, Route } from 'react-router-dom';

import { Navbar } from './containers/navbar/navbar';
import { Footer } from './containers/footer/footer';
import { Home } from './containers/page/home/home';
import { CreateWallet } from './containers/page/createWallet/createWallet';
import { AccessWallet } from './containers/page/accessWallet/accessWallet';
import { Interface } from './containers/page/interface/interface';

import { AuthProvider } from './contexts/authContext';

function App() {
  return (
    <div className='App'>
      <AuthProvider>
        <Navbar></Navbar>
        <div className='App__content'>
          <Switch>
            <Route exact path='/'>
              <Home></Home>
            </Route>
            <Route path='/create-wallet'>
              <CreateWallet></CreateWallet>
            </Route>
            <Route path='/access-wallet'>
              <AccessWallet></AccessWallet>
            </Route>
            <Route path='/interface'>
              <Interface></Interface>
            </Route>
          </Switch>
        </div>
      </AuthProvider>
      <Footer></Footer>
    </div>
  );
}

export default App;
