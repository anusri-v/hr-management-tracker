import { GoogleLogin } from '@react-oauth/google';
import { Divider, Flex, Typography } from 'antd';
import {
  LockOutlined,
} from '@ant-design/icons';

const { Title } = Typography;

type Props = {
    onCredential: (credential: string) => void;
    onError?: () => void;
    error?: string | null;
};

const LoginPage = ({ onCredential, onError, error }: Props) => {
    return (
        <Flex style={{ justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#F7F8FA' }}>
            <Flex style={{ background: '#3CB5B0', height: '35rem', minWidth: '30rem', borderTopLeftRadius: '20px', borderBottomLeftRadius: '20px' }}>
                <Flex style={{ paddingLeft: '60px', paddingTop: '30px' }}>
                    <h2 style={{ color: '#FFF' }}>Shop<span style={{ color: '#FFD43B' }}>Up</span></h2>
                </Flex>
            </Flex>
            <Flex style={{ background: '#FFFFFF', height: '35rem', minWidth: '30rem', borderTopRightRadius: '20px', borderBottomRightRadius: '20px' }}>
                <Flex vertical style={{ justifyContent: 'center', padding: '40px', minWidth: '30rem' }}>
                    <span style={{ textTransform: 'uppercase', fontSize: 12, letterSpacing: '4px', fontWeight: 'bold', color: '#207A78' }}>Sign In</span>
                    <h2>Welcome</h2>
                    <GoogleLogin
                        hosted_domain="shopup.org"
                        text="continue_with"
                        theme="outline"
                        size="large"
                        width="400px"
                        onSuccess={(res) => res.credential && onCredential(res.credential)}
                        onError={onError}
                    />
                    <Flex gap={ 16 } style={{ background: '#F1FAF9', borderColor: '#DFF3F1', borderWidth: '2px', borderStyle: 'solid', borderRadius: '5px', width: 356, padding: 20, marginTop: 16 }}>
                        <LockOutlined style={{ color: '#2E817D' }} />
                        <span style={{ fontSize: 12 }}>Only <b>@shopup.org / @silq.net</b> accounts can access this portal.</span>
                    </Flex>
                </Flex>
            </Flex>
        </Flex>
    );
};

export default LoginPage;
