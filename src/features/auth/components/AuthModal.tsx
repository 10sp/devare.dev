import { AuthProvider, OAuthProvider, signInWithPopup } from 'firebase/auth'
import { FaGithub, FaGoogle } from 'react-icons/fa'
import ReactModal from 'react-modal'
import toast from 'react-simple-toasts'
import { useAuth } from 'src/features/auth'
import { firebaseAuth, githubAuthProvider, googleAuthProvider } from 'src/lib/firebase'

type AuthModalProps = {
  showAuth: boolean
  closeModal: () => void
}

export const AuthModal = ({ showAuth, closeModal }: AuthModalProps) => {
  const { closeAuthModal, initState } = useAuth()

  const signIn = (provider: AuthProvider, providerName: string) => {
    signInWithPopup(firebaseAuth, provider)
      .then((result) => {
        const credential = OAuthProvider.credentialFromResult(result)
        const idToken = credential?.idToken
        const email = result.user.displayName
        const name = result.user.displayName
        const imageURL = result.user.photoURL
        if (idToken && name && email && imageURL) {
          closeAuthModal()
          initState({
            idToken: idToken,
            user: {
              name: name,
              email: email,
              imageURL: imageURL,
            },
          })
        }
      })
      .catch((error) => {
        console.log(error)
        toast(`We couldn't login to your ${providerName} account!!`, { theme: 'failure' })
      })
  }

  return (
    <ReactModal
      isOpen={showAuth}
      ariaHideApp={false}
      shouldCloseOnEsc={true}
      shouldCloseOnOverlayClick={true}
      shouldFocusAfterRender={false}
      onRequestClose={closeModal}
      contentLabel="Auth"
      className="Modal scrollable"
      style={{
        overlay: {
          zIndex: 3,
        },
      }}
      overlayClassName="Overlay">
      <div>
        <div>
          <h1>Welcome to Hackertab</h1>
          <p>
            To enhance your experience and unlock our new rewards system, we’ve introduced a simple
            and secure way to sign in. Connect your account with GitHub or Google to start earning
            rewards, save your progress, and enjoy personalized features.
          </p>
        </div>
        <div>
          <button
            className="extraTextWithIconBtn"
            onClick={() => signIn(githubAuthProvider, 'Github')}>
            <FaGithub />
            Sign in with Github
          </button>
          <button
            className="extraTextWithIconBtn"
            style={{ marginLeft: 10 }}
            onClick={() => signIn(googleAuthProvider, 'Google')}>
            <FaGoogle />
            Sign in with Google
          </button>
        </div>
      </div>
    </ReactModal>
  )
}
